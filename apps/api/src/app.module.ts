import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { ScrapingModule } from './scraping/scraping.module'
import { AnalysisModule } from './analysis/analysis.module'
import { TicketModule } from './ticket/ticket.module'
import { CronModule } from './cron/cron.module'
import { ConnectionModule } from './connection/connection.module'
import { SyncModule } from './sync/sync.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AnalysisModule,
    TicketModule,
    ConnectionModule,
    ScrapingModule,
    CronModule,
    SyncModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
