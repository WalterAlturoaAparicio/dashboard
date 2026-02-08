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
import { SyncClientModule } from './sync/sync-client.module'

const isServerMode = (process.env.DB_DRIVER || 'sqlite') === 'postgres'

// Servidor: scraping + cron + sync endpoint
// Cliente: sync client (consume del servidor)
const serverModules = isServerMode
  ? [ScrapingModule, CronModule, SyncModule]
  : []
const clientModules = isServerMode ? [] : [SyncClientModule]

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
    ...serverModules,
    ...clientModules,
  ],
  controllers: [AppController],
})
export class AppModule {}
