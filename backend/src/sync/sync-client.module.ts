import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sorteo } from '../database/sorteo.entity'
import { ConnectionModule } from '../connection/connection.module'
import { SyncClientService } from './sync-client.service'

@Module({
  imports: [TypeOrmModule.forFeature([Sorteo]), ConnectionModule],
  providers: [SyncClientService],
  exports: [SyncClientService],
})
export class SyncClientModule {}
