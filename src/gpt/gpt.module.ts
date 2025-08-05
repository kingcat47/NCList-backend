import { Module } from '@nestjs/common';
import { GptController } from './gpt.controller';
import { GPTService } from './gpt.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [GptController],
  providers: [GPTService],
})
export class GptModule {}
