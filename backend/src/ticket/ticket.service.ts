import { Injectable } from '@nestjs/common'
import { AnalysisService } from '../analysis/analysis.service'
import { Tipo, GeneratedTicket } from '../common/types'

@Injectable()
export class TicketService {
  constructor(private readonly analysisService: AnalysisService) {}

  async generarTickets(
    tipo: Tipo,
    cantidad: number,
    fecha?: string,
  ): Promise<GeneratedTicket[]> {
    const resumen = await this.analysisService.getResumen(tipo, fecha)
    const poolNumeros = this.construirPool(resumen.numeros)
    const poolSuperbalotas = this.construirPool(resumen.superbalotas)

    const tickets: GeneratedTicket[] = []

    for (let i = 0; i < cantidad; i++) {
      const combinacion = this.generarCombinacion(poolNumeros, 5)
      const superbalota = this.generarCombinacion(poolSuperbalotas, 1)[0]
      tickets.push({ numeros: combinacion, superbalota })
    }

    return tickets
  }

  private construirPool(numeros: Record<string, number>): string[] {
    const pool: string[] = []
    const values = Object.values(numeros)

    if (values.length === 0) return pool

    const max = Math.max(...values)

    for (const [numero, frecuencia] of Object.entries(numeros)) {
      const peso = Math.floor((frecuencia / max) * 10) || 1
      for (let i = 0; i < peso; i++) {
        pool.push(numero)
      }
    }

    return pool
  }

  private generarCombinacion(pool: string[], cantidad: number): string[] {
    const combinacion = new Set<string>()

    while (combinacion.size < cantidad && pool.length > 0) {
      const numero = pool[Math.floor(Math.random() * pool.length)]
      combinacion.add(numero)
    }

    return Array.from(combinacion).sort((a, b) => Number(a) - Number(b))
  }
}
