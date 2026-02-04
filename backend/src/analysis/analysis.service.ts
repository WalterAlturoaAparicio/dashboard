import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan, FindOperator } from 'typeorm'
import { Sorteo } from '../database/sorteo.entity'
import { Tipo, SorteoConteo, SorteoReciente } from '../common/types'

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) {}

  async getResumen(tipo: Tipo, targetDate?: string): Promise<SorteoConteo> {
    const where: { tipo: Tipo; fecha?: FindOperator<Date> } = { tipo }

    if (targetDate) {
      const fechaTarget = new Date(targetDate)
      where.fecha = MoreThan(fechaTarget)
    }

    const sorteos = await this.sorteoRepository.find({
      where,
      order: { fecha: 'ASC' },
    })

    const conteoNumeros: Record<string, number> = {}
    const conteoSuperbalotas: Record<string, number> = {}

    for (const s of sorteos) {
      s.numeros.forEach((n) => {
        conteoNumeros[n] = (conteoNumeros[n] || 0) + 1
      })
      conteoSuperbalotas[s.superbalota] =
        (conteoSuperbalotas[s.superbalota] || 0) + 1
    }

    return {
      totalSorteos: sorteos.length,
      topNumeros: this.getTopFrecuentes(conteoNumeros, 5),
      topSuperbalotas: this.getMasFrecuentes(conteoSuperbalotas),
      numeros: conteoNumeros,
      superbalotas: conteoSuperbalotas,
    }
  }

  async getRecientes(tipo: Tipo, cantidad = 3): Promise<SorteoReciente[]> {
    const sorteosRecientes = await this.sorteoRepository.find({
      where: { tipo },
      order: { fecha: 'DESC' },
      take: cantidad,
    })

    return sorteosRecientes.map((s) => ({
      date: '' + s.fecha,
      numbers: [...s.numeros, s.superbalota],
    }))
  }

  getTopFrecuentes(conteo: Record<string, number>, top: number): string[] {
    const entries = Object.entries(conteo).sort((a, b) => b[1] - a[1])

    if (entries.length === 0) return []

    const topFrecuentes: string[] = []
    const limite = top
    const frecuenciaCorte = entries[top - 1]?.[1] ?? 0

    for (const [numero, freq] of entries) {
      if (topFrecuentes.length < limite || freq === frecuenciaCorte) {
        topFrecuentes.push(numero)
      } else {
        break
      }
    }

    return topFrecuentes
  }

  getMasFrecuentes(conteo: Record<string, number>): string[] {
    const entries = Object.entries(conteo)
    if (entries.length === 0) return []

    const maxFreq = Math.max(...entries.map(([, freq]) => freq))
    return entries
      .filter(([, freq]) => freq === maxFreq)
      .map(([numero]) => numero)
  }
}
