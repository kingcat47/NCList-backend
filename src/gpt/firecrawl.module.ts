import { Module } from '@nestjs/common';
import { FirecrawlController } from './firecrawl.controller';
import { FirecrawlService} from './firecrawl.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [FirecrawlController],
  providers: [FirecrawlService],
})
export class FirecrawlModule {}
