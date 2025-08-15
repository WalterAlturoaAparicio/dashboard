import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import * as cheerio from 'cheerio'

type SorteoConteo = {
  numeros: Record<string, number>
  superbalotas: Record<string, number>
  totalSorteos: number
  topNumeros?: string[]
  topSuperbalotas?: string[]
}

type Resultado = {
  baloto: SorteoConteo
  revancha: SorteoConteo
  paginasVisitadas: number
}

@Injectable()
export class BalotoService {
  private readonly BASE_URL = 'https://baloto.com/resultados'
  private readonly logger = new Logger(BalotoService.name)

  async getResults(targetDate?: string): Promise<Resultado> {
    const resultado: Resultado = {
      baloto: { numeros: {}, superbalotas: {}, totalSorteos: 0 },
      revancha: { numeros: {}, superbalotas: {}, totalSorteos: 0 },
      paginasVisitadas: 0,
    }

    let page = 1
    let keepScraping = true

    while (keepScraping) {
      const url = `${this.BASE_URL}?page=${page}`
      this.logger.debug(`Scrapeando página ${page}: ${url}`)
      const { data: html } = await axios.get(url)
      const $ = cheerio.load(html)

      resultado.paginasVisitadas++

      const rows = $('#results-table tbody tr')
      if (rows.length === 0) break

      rows.each((_, row) => {
        const date = $(row).find('.creation-date-results').first().text().trim()
        const typeImg = $(row).find('td img').attr('src') || ''
        const isBaloto = typeImg.includes('baloto-kind.png')
        const isRevancha = typeImg.includes('revancha-kind.png')

        const tdNumeros = $(row).find('td').eq(2)
        const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
        const numbers = rawNumbers.match(/\d+/g) || []

        const sorteo = isBaloto
          ? resultado.baloto
          : isRevancha
          ? resultado.revancha
          : null
        if (!sorteo) return

        if (targetDate) {
          const fechaActual = this.parseSpanishDate(date)
          const fechaTarget = new Date(targetDate)
          if (fechaActual <= fechaTarget) return
        }

        // Contar números (los 5 primeros)
        numbers.slice(0, 5).forEach((n) => {
          sorteo.numeros[n] = (sorteo.numeros[n] || 0) + 1
        })

        // Contar superbalota (último número)
        const superbalota = numbers[5]
        if (superbalota) {
          sorteo.superbalotas[superbalota] =
            (sorteo.superbalotas[superbalota] || 0) + 1
        }

        sorteo.totalSorteos++
      })

      if (targetDate) {
        const fechaTarget = new Date(targetDate)
        const hayFechasPosteriores = $('#results-table tbody tr')
          .toArray()
          .some((row) => {
            const dateStr = $(row)
              .find('.creation-date-results')
              .first()
              .text()
              .trim()
            const fechaActual = this.parseSpanishDate(dateStr)
            return fechaActual > fechaTarget
          })

        keepScraping = hayFechasPosteriores
        page++
      } else {
        keepScraping = false
      }
    }

    this.logger.log(
      `Scraping terminado. Páginas visitadas: ${resultado.paginasVisitadas}`,
    )
    return {
      ...resultado,
      baloto: {
        ...resultado.baloto,
        topNumeros: this.getTopFrecuentes(resultado.baloto.numeros, 5),
        topSuperbalotas: this.getMasFrecuentes(resultado.baloto.superbalotas),
      },
      revancha: {
        ...resultado.revancha,
        topNumeros: this.getTopFrecuentes(resultado.revancha.numeros, 5),
        topSuperbalotas: this.getMasFrecuentes(resultado.revancha.superbalotas),
      },
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
}
