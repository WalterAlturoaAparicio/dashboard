import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { BalotoService } from './baloto.service'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sorteo } from './database/sorteo.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    TypeOrmModule.forFeature([Sorteo]),
  ],
  controllers: [AppController],
  providers: [BalotoService],
})
export class AppModule {}
