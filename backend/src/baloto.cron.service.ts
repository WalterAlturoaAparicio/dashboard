import { BalotoService } from './baloto.service'
import { Injectable } from '@nestjs/common/decorators'
import { Logger } from '@nestjs/common/services'
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BalotoCronService {
  private readonly logger = new Logger(BalotoCronService.name)

  constructor(private readonly balotoService: BalotoService) {}

  // 0 12 * * 2,4,0 → A las 12:00 los martes (2), jueves (4) y domingos (0)
  @Cron('0 12 * * 2,4,0')
  async handleCron() {
    this.logger.log('Iniciando scraping programado del Baloto...')
    await this.balotoService.getResultsFromAllPages()
    this.logger.log('Scraping programado finalizado.')
  }
}
