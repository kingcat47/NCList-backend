import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as puppeteer from 'puppeteer';

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
    let crawledText: string | null = null;

    const linkMatch = text.match(
        /(https?:\/\/naver\.me\/[a-zA-Z0-9]+|https?:\/\/map\.naver\.com\/[^\s]+)/
    );
    const extractedUrl = linkMatch?.[1];

    if (extractedUrl) {
      try {
        crawledText = await this.crawlNaverMap(extractedUrl);
        console.log('🕷️ 크롤링 텍스트 결과:', crawledText?.slice(0, 300));
      } catch (e) {
        console.warn('⚠️ 크롤링 실패. GPT만 사용합니다.', e);
      }
    }

    const userPrompt = `
다음은 네이버 지도 공유 텍스트와 (가능한 경우) 크롤링된 텍스트야. 이를 기반으로 아래 가게 정보를 정확히 JSON으로 정리해줘.

${crawledText ? `\n[크롤링된 본문 텍스트]\n${crawledText.slice(0, 3000)}\n` : ''}

[입력 텍스트]
${text}

요구사항:
- 가게 이름에서 지역명이 있다면 지역명(예: '강남역', '서울시', '홍대' 등)은 제거하고 상호명만 남겨줘.
- 오늘 날짜의 영업 시간만 추출해. 내일/평일/주말은 제외.
- 최대한 정확하게 유추해서 채워.
- 위치정보는 7글자가 안넘게 줘.(예: '서울 강남구', '신도림역', '용산구 효창동')
- 카테고리는 니가 종합적으로 판단해서 선택지중에 골라서 넣어줘.
- 아래 형식 JSON만 반환. 설명 절대 금지.

{
  "name": "",
  "location": "",
  "hours": "",
  "category": "음식점" | "카페" | "헬스장" | "의료" | "숙박" | "기타",
  "originalUrl": ""
}
    `.trim();

    const requestBody = {
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
              '너는 네이버 지도 텍스트와 크롤링된 본문 텍스트에서 가게 정보를 JSON으로 정확하게 추출하는 전문가야. 절대 설명하지 말고 JSON만 반환해.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    };

    try {
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
        console.error('GPT 원시 응답:', content);
        throw new Error('JSON 응답을 파싱할 수 없습니다.');
      }

      if (!parsed.originalUrl && extractedUrl) {
        parsed.originalUrl = extractedUrl;
      }

      return parsed;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ [AxiosError]');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error('❌ [Unknown Error]', error);
      }

      throw new Error('GPT 응답에서 가게 정보를 가져오는데 실패했습니다.');
    }
  }

  public async crawlNaverMap(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 }); // 모바일 뷰

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 5000)); // 렌더링 여유 시간

    const bodyText = await page.evaluate(() => document.body.innerText);

    await browser.close();

    return bodyText;
  }
}
