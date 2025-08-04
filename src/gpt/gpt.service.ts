import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface StoreInfo {
  name: string;
  location: string;
  status: '영업중' | '곧마감' | '마감';
  hours: string;
  category: '음식점' | '카페' | '헬스장' | '의료' | '숙박' | '기타';
  originalUrl?: string;
}

@Injectable()
export class GPTService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    const gptConfig = this.configService.get('gpt');
    const apiKey = gptConfig?.apiKey;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    this.apiKey = apiKey;
  }

  async extractStoreInfoFromText(text: string): Promise<StoreInfo> {
    const userPrompt = `
다음은 네이버 지도 공유 텍스트야. 여기에 포함된 링크가 있으면 실제로 링크 내용을 검색했다고 가정하고, 
그 결과를 바탕으로 정확한 가게 정보를 아래 JSON 형식으로 추출해.

- 가게 이름에서 지역명(예: '강남역', '서울시', '홍대' 등)은 제거하고 실제 상호명만 남겨줘.
- 오늘 날짜의 영업 시간만 추출해. 내일이나 평일/주말 정보는 제외.
- 정보가 명확하지 않으면 유추해서 최대한 채워줘.
- 출력은 반드시 아래 JSON 형식 **그 자체만** 포함해야 하고, 설명 텍스트는 절대 추가하지 마.

{
  "name": "",
  "location": "",
  "status": "영업중" | "곧마감" | "마감",
  "hours": "",
  "category": "음식점" | "카페" | "헬스장" | "의료" | "숙박" | "기타",
  "originalUrl": ""
}

입력:
"${text}"
    `.trim();

    const requestBody = {
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: '너는 네이버 지도 텍스트에서 JSON 형태의 가게 정보를 정밀하게 추출하는 전문가야. 절대 설명이나 안내문을 출력하지 마. JSON만 반환해.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    };

    try {
      console.log('🧾 OpenAI 요청 파라미터:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) throw new Error('GPT 응답이 비어있습니다.');

      let parsed: StoreInfo | null = null;

      try {
        parsed = JSON.parse(content.trim());
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {}
        }
      }

      if (!parsed) {
        console.error('📦 GPT 원시 응답:', content);
        throw new Error('JSON 응답을 파싱할 수 없습니다.');
      }

      if (!parsed.originalUrl) {
        const linkMatch = text.match(/(https?:\/\/naver\.me\/[a-zA-Z0-9]+|https?:\/\/map\.naver\.com\/[^\s]+)/);
        if (linkMatch) {
          parsed.originalUrl = linkMatch[1];
        }
      }

      return parsed;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ [AxiosError]');
        console.error('🔹 Status:', error.response?.status);
        console.error('🔹 Data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error('❌ [Unknown Error]', error);
      }

      throw new Error('GPT 응답에서 가게 정보를 가져오는데 실패했습니다.');
    }
  }
}
