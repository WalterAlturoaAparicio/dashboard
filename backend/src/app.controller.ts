import { Controller, Get, Post, Put, Query } from '@nestjs/common'
import { BalotoService, Tipo } from './baloto.service'

@Controller()
export class AppController {
  constructor(private readonly balotoService: BalotoService) {}

  @Get('conteo')
  async getConteo(@Query('fecha') fecha?: string, @Query('tipo') tipo?: Tipo) {
    const conteo = await this.balotoService.getResumen(tipo, fecha)
    return conteo
  }

  @Get('recent-draws')
  async getRecentDraws(
    @Query('cantidad') cantidad?: number,
    @Query('tipo') tipo?: 'baloto' | 'revancha',
  ) {
    const conteo = await this.balotoService.getRecientes(tipo, cantidad)
    return conteo
  }

  @Get('generar')
  async generar(
    @Query('fecha') fecha?: string,
    @Query('tipo') tipo?: Tipo,
    @Query('tickets') maxTickets?: number,
  ) {
    const resumen = await this.balotoService.getResumen(tipo, fecha)
    const numTickets = maxTickets ? maxTickets : 1
    const tickets = this.balotoService.generarTickets(
      resumen.numeros,
      resumen.superbalotas,
      numTickets,
    )
    return tickets
  }

  @Put('load')
  async loadHistory() {
    const conteo = await this.balotoService.loadHistoricalData()
    return conteo
  }

  @Post('refresh')
  async refreshHistory() {
    const conteo = await this.balotoService.getResultsFromAllPages()
    return conteo
  }
}
