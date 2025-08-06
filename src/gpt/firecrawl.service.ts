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

  /**
   * 네이버 지도 공유 텍스트에서 링크 제외한 참고용 텍스트를 받아
   * 해당 텍스트를 AI 추출 prompt에 포함시켜 JSON 추출 정확도를 높임
   * @param resolvedUrl 네이버 지도 장소 URL (크롤링 대상)
   * @param referenceText 링크 제외한 참고 텍스트 (예: 매장명, 주소 등)
   */
  async extractStoreInfoFromUrl(resolvedUrl: string, referenceText: string): Promise<StoreInfo> {
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

    // Prompt에 referenceText(링크 제외한 텍스트) 포함
    const prompt = `
다음 네이버 지도 장소 HTML 콘텐츠에서 아래 형식의 JSON으로 정보를 추출하세요.

추가 참고 텍스트(링크 제외한 입력값):
${referenceText}

크롤링한 정보 중 이모티콘이 많다면 이모티콘들은 무시하세요. 헬스장과 같은 지점에서 꾸미기 위해 많이 사용합니다.
만약 크롤링 결과가 아래 조건들을 만족시키기 어렵다면 최대한 확실한 정보로 추론해서 값을 넣고 카테고리를 기타로 분류하세요.
만약 마지막에 가서도 정말 모르겠으면 "정보없음"으로 채우세요.

조건:
- JSON key는 반드시 "name", "location", "hours", "category"로 구성
- "name"은 매장 이름만, 지역명/지점명 제거 (예: "버거킹 강남역점" → "버거킹")
- "location"은 지역 정보로, 주소에서 동, 역, 지명 등 최대 6자
- "hours"는 영업 시간 (예: "10:00 - 22:00", "09:00 - 20:00", "07:00 - 24:00" 등등)
  휴일/휴무면 "휴무", 24시간 영업이면 "00:00 - 24:00", 그 외 기타는 "정보 없음"으로 기입
- "category"는 "음식점", "카페", "헬스장", "의료", "숙박", "기타" 중 하나
  `.trim();

    const requestBody = {
      url: resolvedUrl,
      formats: ['json'],
      jsonOptions: {
        prompt,
        schema: jsonSchema,
      },
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

      const extractedJson = response.data?.data?.json;
      if (!extractedJson) {
        throw new Error('Firecrawl 응답에 추출 결과가 없습니다.');
      }

      return {
        name: extractedJson.name,
        location: extractedJson.location,
        hours: extractedJson.hours,
        category: extractedJson.category,
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

  // HTML 크롤링용 함수, 필요시 사용
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
