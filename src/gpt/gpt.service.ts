import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { StoresService } from 'src/stores/stores.service';
import {StoreInfoDto} from '../stores/dto/yuchan.dto'
import { CreateStoreDto } from 'src/stores/dto/create-store.dto';
@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor(
      private readonly configService: ConfigService,
      private readonly storesService: StoresService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow('gpt.apiKey'),
    });
  }

  async extract_store_info(text_store_name:string, yuchan_lets_go:StoreInfoDto,userId: string) {
    try {
      console.log('GPT 분석 시작');
      console.log('받은 저장할이름:', text_store_name);
      console.log('받은 json :', yuchan_lets_go);

      const businessHoursString = (yuchan_lets_go.business_hours ?? [])
          .map((entry) => `${entry.day}: ${entry.start} - ${entry.end}`)
          .join(', ');
      console.log('영업시간 문자열:', businessHoursString);

      const prompt = this.buildPrompt(yuchan_lets_go, businessHoursString);


      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
                '다음 입력에서 위치(location), 영업 시간(hours), 카테고리(category)를 사용자가 원하는 형태로 가공해서 JSON으로 반환 하세요.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'edit_gpt',
              description: '월요일부터 일요일까지의 영업시간과 카테고리를 추출합니다.',
              parameters: {
                type: 'object',
                properties: {
                  hours: {
                    type: 'object',
                    description: '요일별 영업시간 ( 영업시간이 나와있는경우 "HH:hh - HH:hh" 형식. 24시간인경우 "00:00 - 24:00"으로 저장. 쉬는날이면 휴무"로 저장)',
                    properties: {
                      monday: { type: 'string', description: '월요일 영업시간' },
                      tuesday: { type: 'string', description: '화요일 영업시간' },
                      wednesday: { type: 'string', description: '수요일 영업시간' },
                      thursday: { type: 'string', description: '목요일 영업시간' },
                      friday: { type: 'string', description: '금요일 영업시간' },
                      saturday: { type: 'string', description: '토요일 영업시간' },
                      sunday: { type: 'string', description: '일요일 영업시간' },
                    },
                    required: [
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                      'sunday',
                    ],
                  },
                  category: {
                    type: 'string',
                    enum: ['음식', '카페', '헬스', '의료', '숙박', '기타'],
                    description: '정해진 카테고리 중 하나를 고르시오. 음식, 카페, 헬스, 의료, 숙박, 기타',
                  },
                },
                required: ['hours', 'category'],
              },
            },
          },
        ]
        ,
        tool_choice: {
          type: 'function',
          function: { name: 'edit_gpt' },
        },
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.type !== 'function') {
        throw new InternalServerErrorException('GPT 도구 호출 실패');
      }

      const toolResponse = (toolCall as any).function?.arguments;
      if (!toolResponse) {
        throw new InternalServerErrorException('GPT 응답에서 정보를 추출하지 못했습니다.');
      }

      const parsed = JSON.parse(toolResponse);

      console.log('GPT 분석 결과');
      console.log('월:', parsed.hours.monday);
      console.log('화:', parsed.hours.tuesday);
      console.log('수:', parsed.hours.wednesday);
      console.log('목:', parsed.hours.thursday);
      console.log('금:', parsed.hours.friday);
      console.log('토:', parsed.hours.saturday);
      console.log('일:', parsed.hours.sunday);
      console.log('카테고리:', parsed.category);


      const storeCreateDto:CreateStoreDto = {
        name: text_store_name,
        location: yuchan_lets_go.address,
        monday: parsed.hours.monday ?? '정보 없음',
        tuesday: parsed.hours.tuesday ?? '정보 없음',
        wednesday: parsed.hours.wednesday ?? '정보 없음',
        thursday: parsed.hours.thursday ?? '정보 없음',
        friday: parsed.hours.friday ?? '정보 없음',
        saturday: parsed.hours.saturday ?? '정보 없음',
        sunday: parsed.hours.sunday ?? '정보 없음',
        link: yuchan_lets_go.url,
        category: parsed.category,
      };

      const store = await this.storesService.create(storeCreateDto, userId);
      console.log('Store 생성 완료', store);
      return store;
    } catch (error) {
      console.error('GPT 처리 중 오류', error);
      throw new InternalServerErrorException('가게 정보 분석 및 저장 실패');
    }
  }

  private buildPrompt( yuchan_lets_go: StoreInfoDto, businessHoursString: string): string {
    return `

[가게 카테고리]
${yuchan_lets_go.category}
카테고리를 보고 가장 적합한 카테고리를 선택하세요. 음식, 카페, 헬스, 의료, 숙박, 기타 중 하나여야 합니다.

[가게 운영시간]
${businessHoursString}
요일별 영업시간을 구해내세요.
영업시간이 나와있는경우 "HH:hh - HH:hh" 형식.
24시간,24시간 영업과 같은 단어인경우 "00:00 - 24:00"으로 저장.
쉬는날이면 휴무"로 저장.
값이 아무것도 없다면 "정보 없음"으로 저장하세요.

{
  "hours": {
    "monday": "",
    "tuesday": "",
    "wednesday": "",
    "thursday": "",
    "friday": "",
    "saturday": "",
    "sunday": ""
  },
  "category": ""
}
    `.trim();
  }
}
