import { Module } from '@nestjs/common';
import { GptController } from './gpt.controller';
import { GPTService } from './gpt.service';
import { StoresModule } from '../stores/stores.module'; // ✅ 추가

@Module({
  imports: [StoresModule], // ✅ 여기 추가
  controllers: [GptController],
  providers: [GPTService],
})
export class GptModule {}
