import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sorteo } from '../database/sorteo.entity'
import { AnalysisService } from './analysis.service'

@Module({
  imports: [TypeOrmModule.forFeature([Sorteo])],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
