import { Module } from '@nestjs/common'
import { ScrapingModule } from '../scraping/scraping.module'
import { CronService } from './cron.service'

@Module({
  imports: [ScrapingModule],
  providers: [CronService],
})
export class CronModule {}
