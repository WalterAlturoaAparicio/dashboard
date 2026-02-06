import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ScrapingService } from '../scraping/scraping.service'

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name)

  constructor(private readonly scrapingService: ScrapingService) {}

  // 0 12 * * 2,4,0 -> A las 12:00 los martes (2), jueves (4) y domingos (0)
  @Cron('0 12 * * 2,4,0')
  async handleCron() {
    this.logger.log('Iniciando scraping programado del Baloto...')
    try {
      await this.scrapingService.getResultsFromAllPages()
      this.logger.log('Scraping programado finalizado.')
    } catch (error) {
      this.logger.error(
        `Error en scraping programado: ${error.message}`,
        error.stack,
      )
    }
  }
}
