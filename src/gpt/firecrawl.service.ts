import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface StoreInfo {
  name: string;
  location: string;
  hours: string;
  category: '음식점' | '카페' | '헬스장' | '의료' | '숙박' | '기타';
  originalUrl?: string;
}

@Injectable()
export class FirecrawlService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.firecrawl.dev/v1/scrape';

  constructor(private configService: ConfigService) {
    const firecrawlConfig = this.configService.get('firecrawl');
    const apiKey = firecrawlConfig?.apiKey;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    this.apiKey = apiKey;
  }

  async extractStoreInfoFromUrl(resolvedUrl: string): Promise<StoreInfo> {
    // Firecrawl API가 인식하는 순수 JSON Schema 객체
    const jsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        location: { type: 'string' },
        hours: { type: 'string' },
        category: {
          type: 'string',
          enum: ['음식점', '카페', '헬스장', '의료', '숙박', '기타'],
        },
      },
      required: ['name', 'location', 'hours', 'category'],
      additionalProperties: false,
    };

    const jsonOptions = {
      prompt: `
다음 네이버 지도 장소 HTML 콘텐츠에서 아래 형식의 JSON으로 정보를 추출하세요.
 
클로링한 정보중에 이모티콘이 많다면 이모티콘들은 무시하세요.헬스장과 같은 지점에서 꾸미기 위해 많이 사용합니다.

조건:
- JSON은 반드시 key가 "name", "location", "hours", "category"로 구성되어야 합니다.
- "name"은 매장 이름만, 지역명/지점명은 제거 (예: "버거킹 강남역점" → "버거킹")
- "location"은 지역 정보로, 주소에서 동, 역, 지명 등 최대 6자
- "hours"는 영업 시간 (예: "10:00 - 22:00", "09:00 - 20:00", "07:00 - 24:00", "09:00 - 18:00", "10:00 - 20:00", "11:00 - 22:00", "12:00 - 21:00", "08:00 - 17:00", "11:30 - 21:30", "10:00 - 23:00", "09:00 - 22:00", "08:00 - 20:00", "12:00 - 00:00", "07:00 - 19:00", "06:00 - 23:00", "05:30 - 00:00", "00:00 - 24:00", "09:00 - 01:00", "07:00 - 22:00", "09:00 - 13:00", "14:00 - 18:00", "09:30 - 20:30", "10:00 - 16:00", "08:30 - 19:00", "15:00 - 11:00", "16:00 - 12:00", "07:00 - 03:00", "10:00 - 02:00" 등등)
   만약 휴일이나 휴무와 같은 경우 시간대신 "휴무"라고 적어주세요.
   만약 24시간 영업등의 텍스트로 채워져 있다면 "24시간 영업"이라고 적어주세요.
   만약 영업시간 정보가 없거나 음식점,카페,헬스장,의료,숙박이 아닌 기타로 분류되는 건물인것 같다면 시간 정보는 "정보 없음"이라고 적어주세요.
- "category"는 아래 중 가장 알맞은 하나만:
- 음식점
- 카페
- 헬스장
- 의료
- 숙박
- 기타

원하는 응답 형식JSON:
{
"name": "",
"location": "",
"hours": "",
"category": ""
}

크롤링 후에는 다음과 같은 조건들을 확인해보고 JSON을 주세요

만약 크롤링 결과가 아래 조건들을 만족 시키기 어렵다면 최대한 확실한 정보로 추론해서 값을 넣고 카테고리를 기타로 분류하세요.
만약 마지막에 가서도 정말 모르겠는경우는 다시 해당사이트를 크롤링해서 데이터를 가져오세요.
`.trim(),
      schema: jsonSchema,
    };

    const requestBody = {
      url: resolvedUrl,
      formats: ['json'],
      jsonOptions,
      onlyMainContent: true,
      timeout: 60000,
    };

    try {
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 70000,
      });

      console.log('Firecrawl 응답 전체:', JSON.stringify(response.data, null, 2));

      const json = response.data?.data?.json;
      if (!json) {
        throw new Error('Firecrawl 응답에 추출 결과가 없습니다.');
      }

      return {
        name: json.name,
        location: json.location,
        hours: json.hours,
        category: json.category,
        originalUrl: resolvedUrl,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Firecrawl AxiosError]');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error('[Unknown Error]', error);
      }
      throw new Error('Firecrawl 응답에서 가게 정보를 가져오는데 실패했습니다.');
    }
  }

  public async crawlNaverMap(url: string): Promise<string> {
    const requestBody = {
      url,
      formats: ['html'],
      onlyMainContent: false,
      timeout: 60000,
    };

    const response = await axios.post(this.apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 70000,
    });

    console.log('Firecrawl HTML 응답 일부:', response.data?.data?.html?.slice(0, 500));

    return response.data?.data?.html || '';
  }
}
