import { Controller, Get, Query } from '@nestjs/common'
import { BalotoService } from './baloto.service'

@Controller()
export class AppController {
  constructor(private readonly balotoService: BalotoService) {}

  @Get('conteo')
  async getConteo(@Query('fecha') fecha?: string) {
    const conteo = await this.balotoService.getResults(fecha)
    return conteo
  }

  @Get('generar')
  async generar(
    @Query('fecha') fecha?: string,
    @Query('tickets') maxTickets?: number,
  ) {
    const resultado = await this.balotoService.getResults(fecha)
    const numTickets = maxTickets ? maxTickets : 1
    const tickets = this.balotoService.generarTickets(
      resultado.baloto.numeros,
      resultado.baloto.superbalotas,
      numTickets,
    )
    return tickets
  }
}
