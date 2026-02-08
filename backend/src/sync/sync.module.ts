import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sorteo } from '../database/sorteo.entity'
import { SyncService } from './sync.service'
import { SyncController } from './sync.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Sorteo])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
