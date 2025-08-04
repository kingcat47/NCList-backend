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
}
