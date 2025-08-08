import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { GptService } from './gpt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface RequestWithUser extends Request {
    user: { id: string };
}

@Controller('gpt')
export class GptController {
    constructor(private readonly gptService: GptService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post('analyze')
    async analyzeTextOnly(
        @Body('text_store_name') text_store_name: string,
        @Body('yuchan_lets_go') yuchan_lets_go: any,
        @Req() req: RequestWithUser,
    ) {
        if (!text_store_name || !yuchan_lets_go) {
            throw new BadRequestException('텍스트 및 DTO가 필요합니다.');
        }

        const userId = req.user.id;
        console.log('[GptController] 분석 요청 도착:', {userId});

        const result = await this.gptService.extract_store_info(
            text_store_name,
            yuchan_lets_go,
            userId,
        );

        console.log('[GptController] 분석 결과 반환');
        return result;
    }
}