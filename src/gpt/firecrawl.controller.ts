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
      @Body() body: { text: string; resolvedUrl: string },
      @Request() req,
  ) {
    const userId = req.user.id;

    const storeInfo = await this.firecrawlService.extractStoreInfoFromUrl(body.resolvedUrl);

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
