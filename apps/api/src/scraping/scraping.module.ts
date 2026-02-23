import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sorteo } from '../database/sorteo.entity'
import { ScrapingService } from './scraping.service'

@Module({
  imports: [TypeOrmModule.forFeature([Sorteo])],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
