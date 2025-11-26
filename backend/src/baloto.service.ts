import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Sorteo } from './database/sorteo.entity'
import { MoreThan, Repository } from 'typeorm'

type SorteoConteo = {
  numeros: Record<string, number>
  superbalotas: Record<string, number>
  totalSorteos: number
  topNumeros?: string[]
  topSuperbalotas?: string[]
}
type SorteoReciente = {
  date: string
  numbers: number[]
}

export type Tipo = 'baloto' | 'revancha'

@Injectable()
export class BalotoService {
  private readonly BASE_URL = 'https://baloto.com/resultados'
  private readonly logger = new Logger(BalotoService.name)

  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) {}

  async getResumen(tipo: Tipo, targetDate?: string): Promise<SorteoConteo> {
    if (!['baloto', 'revancha'].includes(tipo)) {
      throw new Error(
        'Tipo de sorteo inválido. Debe ser "baloto" o "revancha".',
      )
    }

    const where: any = { tipo }
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

  parseSpanishDate(dateStr: string): Date {
    const months: { [key: string]: number } = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    }

    const regex = /(\d{1,2}) de (\w+) de (\d{4})/
    const match = dateStr.toLowerCase().match(regex)

    if (!match) throw new Error(`Formato de fecha inválido: ${dateStr}`)

    const day = parseInt(match[1])
    const month = months[match[2]]
    const year = parseInt(match[3])

    return new Date(year, month, day)
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const maxFreq = Math.max(...entries.map(([_, freq]) => freq))
    return (
      entries
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, freq]) => freq === maxFreq)
        .map(([numero]) => numero)
    )
  }

  construirPool(numeros: Record<string, number>): string[] {
    const pool: string[] = []
    const max = Math.max(...Object.values(numeros))

    for (const [numero, frecuencia] of Object.entries(numeros)) {
      const peso = Math.floor((frecuencia / max) * 10) || 1
      for (let i = 0; i < peso; i++) {
        pool.push(numero)
      }
    }

    return pool
  }

  generarCombinacion(pool: string[], cantidad: number): string[] {
    const combinacion = new Set<string>()
    while (combinacion.size < cantidad) {
      const numero = pool[Math.floor(Math.random() * pool.length)]
      combinacion.add(numero)
    }
    return Array.from(combinacion).sort((a, b) => Number(a) - Number(b))
  }

  generarTickets(
    numeros: Record<string, number>,
    superbalotas: Record<string, number>,
    cantidad: number,
  ): { numeros: string[]; superbalota: string }[] {
    const poolNumeros = this.construirPool(numeros)
    const poolSuperbalotas = this.construirPool(superbalotas)

    const tickets = []

    for (let i = 0; i < cantidad; i++) {
      const combinacion = this.generarCombinacion(poolNumeros, 5)
      const superbalota = this.generarCombinacion(poolSuperbalotas, 1)[0]
      tickets.push({ numeros: combinacion, superbalota })
    }

    return tickets
  }

  async getResultsFromAllPages(): Promise<void> {
    let page = 1
    let shouldContinue = true

    while (shouldContinue) {
      const url = `${this.BASE_URL}?page=${page}`
      const { data: html } = await axios.get(url)
      const $ = cheerio.load(html)

      const rows = $('#results-table tbody tr').toArray()

      // Si ya no hay filas, detenemos el scraping
      if (rows.length === 0) {
        console.log(`No hay más resultados en la página ${page}.`)
        break
      }

      console.log(`Procesando página ${page} (${rows.length} filas)...`)

      for (const row of rows) {
        const date = $(row).find('.creation-date-results').first().text().trim()
        const typeImg = $(row).find('td img').attr('src') || ''
        const isBaloto = typeImg.includes('baloto-kind.png')
        const isRevancha = typeImg.includes('revancha-kind.png')

        const tdNumeros = $(row).find('td').eq(2)
        const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
        const numbers = rawNumbers.match(/\d+/g) || []

        const fechaActual = this.parseSpanishDate(date)
        const tipo = isBaloto ? 'baloto' : isRevancha ? 'revancha' : null
        if (!tipo) continue

        const existe = await this.sorteoRepository.findOne({
          where: { fecha: fechaActual, tipo },
        })

        if (existe) {
          console.log(
            `Registro existente encontrado (${tipo} - ${fechaActual}), deteniendo...`,
          )
          shouldContinue = false
          break
        }

        await this.sorteoRepository.save({
          fecha: fechaActual,
          tipo,
          numeros: numbers.slice(0, 5).map(Number),
          superbalota: Number(numbers[5]),
          fuente: url,
        })

        console.log(`Guardado: ${tipo} - ${fechaActual}`)
      }

      // Si ya encontramos un registro existente, salimos del bucle
      if (!shouldContinue) break

      // Pasamos a la siguiente página
      page++
    }

    console.log('Scraping completado.')
  }

  async loadHistoricalData(): Promise<void> {
    let page = 1
    let keepScraping = true

    while (keepScraping) {
      const url = `${this.BASE_URL}?page=${page}`
      this.logger.debug(`Cargando página histórica ${page}: ${url}`)

      const { data: html } = await axios.get(url)
      const $ = cheerio.load(html)

      const rows = $('#results-table tbody tr').toArray()
      if (rows.length === 0) break // No más resultados

      for (const row of rows) {
        const date = $(row).find('.creation-date-results').first().text().trim()
        const typeImg = $(row).find('td img').attr('src') || ''
        const isBaloto = typeImg.includes('baloto-kind.png')
        const isRevancha = typeImg.includes('revancha-kind.png')

        const tdNumeros = $(row).find('td').eq(2)
        const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
        const numbers = rawNumbers.match(/\d+/g) || []

        const fechaActual = this.parseSpanishDate(date)
        const tipo = isBaloto ? 'baloto' : isRevancha ? 'revancha' : null
        if (!tipo) continue

        const existe = await this.sorteoRepository.findOne({
          where: { fecha: fechaActual, tipo },
        })

        if (!existe) {
          await this.sorteoRepository.save({
            fecha: fechaActual,
            tipo,
            numeros: numbers.slice(0, 5).map(Number),
            superbalota: Number(numbers[5]),
            fuente: url,
          })
        }
      }

      page++
      keepScraping = page <= 92 // o detectarlo dinámicamente
    }

    this.logger.log('Carga histórica finalizada')
  }

  async getRecientes(tipo: Tipo, cantidad = 3): Promise<SorteoReciente[]> {
    if (!['baloto', 'revancha'].includes(tipo)) {
      throw new Error(
        'Tipo de sorteo inválido. Debe ser "baloto" o "revancha".',
      )
    }

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
}
