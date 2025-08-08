import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { StoresModule } from 'src/stores/stores.module';

@Module({
  imports: [ConfigModule, StoresModule],
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
