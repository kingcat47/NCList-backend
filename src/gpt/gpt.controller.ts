import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GPTService } from './gpt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoresService } from '../stores/stores.service';

@Controller('api/gpt')
@UseGuards(JwtAuthGuard)
export class GptController {
  constructor(
      private readonly gptService: GPTService,
      private readonly storesService: StoresService,
  ) {}

  @Post('extract-store-info')
  async extractStoreInfo(
      @Body() body: { text: string },
      @Request() req,
  ) {
    const userId = req.user.id;
    const storeInfo = await this.gptService.extractStoreInfoFromText(body.text);

    const saved = await this.storesService.create({
      name: storeInfo.name,
      location: storeInfo.location,
      status: storeInfo.status,
      hours: storeInfo.hours,
      category: storeInfo.category,
      originalUrl: storeInfo.originalUrl,
    }, userId);

    return {
      success: true,
      data: saved,
    };
  }

  // 🔍 크롤링 전용 API: GPT 없이 크롤링 결과만 확인
  @Post('crawl')
  async crawlNaverMap(@Body() body: { url: string }) {
    try {
      const result = await this.gptService.crawlNaverMap(body.url);
      console.log(' 크롤링 성공:', result);

      return {
        success: true,
        data: result,
      };
    } catch (e) {
      console.error('❌ 크롤링 실패:', e);
      return {
        success: false,
        error: e.message ?? '크롤링 중 오류 발생',
      };
    }
  }
}
