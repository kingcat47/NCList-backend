import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FirecrawlService } from './firecrawl.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoresService } from '../stores/stores.service';

@Controller('api/firecrawl')
@UseGuards(JwtAuthGuard)
export class FirecrawlController {
  constructor(
      private readonly firecrawlService: FirecrawlService,
      private readonly storesService: StoresService,
  ) {}

  @Post('extract-store-info')
  async extractStoreInfo(
      @Body() body: { text: string; textWithoutUrl?: string; resolvedUrl: string },
      @Request() req,
  ) {
    const userId = req.user.id;

    // textWithoutUrl 값 없으면 빈 문자열 처리 (안 넣으면 prompt에 아무 내용 없으므로)
    const referenceText = body.textWithoutUrl ?? '';

    // service 호출 시 두번째 인자로 참고 텍스트 전달
    const storeInfo = await this.firecrawlService.extractStoreInfoFromUrl(
        body.resolvedUrl,
        referenceText,
    );

    const saved = await this.storesService.create(
        {
          name: storeInfo.name,
          location: storeInfo.location,
          hours: storeInfo.hours,
          category: storeInfo.category,
          originalUrl: body.resolvedUrl,
        },
        userId,
    );

    return {
      success: true,
      data: saved,
    };
  }

  @Post('crawl')
  async crawlNaverMap(@Body() body: { url: string }) {
    try {
      const result = await this.firecrawlService.crawlNaverMap(body.url);
      console.log('크롤링 성공:', result);

      return {
        success: true,
        data: result,
      };
    } catch (e) {
      console.error('크롤링 실패:', e);
      return {
        success: false,
        error: e.message ?? '크롤링 중 오류 발생',
      };
    }
  }
}
