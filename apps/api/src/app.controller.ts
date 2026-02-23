import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common'
import { AnalysisService } from './analysis/analysis.service'
import { TicketService } from './ticket/ticket.service'
import { ScrapingService } from './scraping/scraping.service'
import { ConnectionService } from './connection/connection.service'
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe'
import {
  ConteoQuerySchema,
  ConteoQueryDto,
  RecentDrawsQuerySchema,
  RecentDrawsQueryDto,
  GenerarQuerySchema,
  GenerarQueryDto,
} from './common/dto'

@Controller()
export class AppController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly ticketService: TicketService,
    private readonly connectionService: ConnectionService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get('conteo')
  @UsePipes(new ZodValidationPipe(ConteoQuerySchema))
  async getConteo(@Query() query: ConteoQueryDto) {
    return this.analysisService.getResumen(query.tipo, query.fecha)
  }

  @Get('recent-draws')
  @UsePipes(new ZodValidationPipe(RecentDrawsQuerySchema))
  async getRecentDraws(@Query() query: RecentDrawsQueryDto) {
    return this.analysisService.getRecientes(query.tipo, query.cantidad)
  }

  @Get('generar')
  @UsePipes(new ZodValidationPipe(GenerarQuerySchema))
  async generar(@Query() query: GenerarQueryDto) {
    return this.ticketService.generarTickets(
      query.tipo,
      query.tickets,
      query.fecha,
    )
  }

  @Get('status')
  async getStatus() {
    const online = await this.connectionService.checkConnection()
    return {
      online,
      lastScrape: this.scrapingService.getLastScrapeTime(),
    }
  }

  @Put('load')
  async loadHistory() {
    await this.scrapingService.loadHistoricalData()
    return { message: 'Carga historica completada' }
  }

  @Post('refresh')
  async refreshHistory() {
    await this.scrapingService.getResultsFromAllPages()
    return { message: 'Datos actualizados' }
  }
}
