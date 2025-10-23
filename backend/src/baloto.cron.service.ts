import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { BalotoService } from './baloto.service'

@Injectable()
export class BalotoCronService {
  private readonly logger = new Logger(BalotoCronService.name)

  constructor(private readonly balotoService: BalotoService) {}

  // 0 12 * * 2,4,0 → A las 12:00 los martes (2), jueves (4) y domingos (0)
  @Cron('0 12 * * 2,4,0')
  async handleCron() {
    this.logger.log('Iniciando scraping programado del Baloto...')
    await this.balotoService.getResultsFromFirstPage()
    this.logger.log('Scraping programado finalizado.')
  }
}
