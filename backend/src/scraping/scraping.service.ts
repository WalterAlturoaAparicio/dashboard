import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import { Sorteo } from '../database/sorteo.entity'
import { parseSpanishDate } from '../common/utils/date-parser'
import { Tipo } from '../common/types'

@Injectable()
export class ScrapingService {
  private readonly BASE_URL = 'https://baloto.com/resultados'
  private readonly logger = new Logger(ScrapingService.name)
  private lastScrapeTime: Date | null = null
  private readonly MIN_SCRAPE_INTERVAL_MS = 60 * 1440 * 1000 // 1 hora

  private readonly http: AxiosInstance = axios.create({
    timeout: 30_000,
    headers: { 'User-Agent': 'BalotoGenerator/1.0' },
  })

  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) {}

  getLastScrapeTime(): Date | null {
    return this.lastScrapeTime
  }

  private checkRateLimit(): void {
    if (this.lastScrapeTime) {
      const elapsed = Date.now() - this.lastScrapeTime.getTime()
      if (elapsed < this.MIN_SCRAPE_INTERVAL_MS) {
        const minutes = Math.ceil(
          (this.MIN_SCRAPE_INTERVAL_MS - elapsed) / 60000,
        )
        throw new HttpException(
          `Scraping disponible en ${minutes} minuto(s)`,
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }
    }
  }

  private async fetchWithRetry(url: string, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data } = await this.http.get(url)
        return data
      } catch (error) {
        if (attempt === maxRetries) throw error
        const delay = Math.pow(2, attempt) * 1000
        this.logger.warn(
          `Intento ${attempt} fallido para ${url}, reintentando en ${delay}ms...`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    throw new Error('Unreachable')
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  async getResultsFromAllPages(): Promise<void> {
    this.checkRateLimit()

    let page = 1
    let shouldContinue = true

    try {
      while (shouldContinue) {
        const url = `${this.BASE_URL}?page=${page}`
        this.logger.debug(`Procesando pagina ${page}: ${url}`)

        const html = await this.fetchWithRetry(url)
        const $ = cheerio.load(html)

        const rows = $('#results-table tbody tr').toArray()

        if (rows.length === 0) {
          this.logger.debug(`No hay mas resultados en la pagina ${page}.`)
          break
        }

        this.logger.debug(`Procesando pagina ${page} (${rows.length} filas)...`)

        for (const row of rows) {
          const date = $(row)
            .find('.creation-date-results')
            .first()
            .text()
            .trim()
          const typeImg = $(row).find('td img').attr('src') || ''
          const isBaloto = typeImg.includes('baloto-kind.png')
          const isRevancha = typeImg.includes('revancha-kind.png')

          const tdNumeros = $(row).find('td').eq(2)
          const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
          const numbers = rawNumbers.match(/\d+/g) || []

          const fechaParsed = parseSpanishDate(date)
          const fechaStr = this.formatDate(fechaParsed)
          const tipo: Tipo | null = isBaloto
            ? 'baloto'
            : isRevancha
            ? 'revancha'
            : null

          if (!tipo) continue

          const existe = await this.sorteoRepository.findOne({
            where: { fecha: fechaStr, tipo },
          })

          if (existe) {
            this.logger.debug(
              `Registro existente (${tipo} - ${fechaStr}), deteniendo...`,
            )
            shouldContinue = false
            break
          }

          await this.sorteoRepository.save({
            fecha: fechaStr,
            tipo,
            numeros: numbers.slice(0, 5).map(Number),
            superbalota: Number(numbers[5]),
            fuente: url,
          })

          this.logger.debug(`Guardado: ${tipo} - ${fechaStr}`)
        }

        if (!shouldContinue) break
        page++
      }

      this.lastScrapeTime = new Date()
      this.logger.log('Scraping completado.')
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error('Error durante el scraping', error.stack)
      if (axios.isAxiosError(error)) {
        if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
          throw new ServiceUnavailableException('Sin conexion a internet')
        }
        if (error.response?.status) {
          throw new ServiceUnavailableException(
            `baloto.com respondio con estado ${error.response.status}`,
          )
        }
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con baloto.com',
      )
    }
  }

  async loadHistoricalData(): Promise<void> {
    this.checkRateLimit()

    let page = 1

    try {
      while (true) {
        const url = `${this.BASE_URL}?page=${page}`
        this.logger.debug(`Cargando pagina historica ${page}: ${url}`)

        const html = await this.fetchWithRetry(url)
        const $ = cheerio.load(html)

        const rows = $('#results-table tbody tr').toArray()
        if (rows.length === 0) break

        for (const row of rows) {
          const date = $(row)
            .find('.creation-date-results')
            .first()
            .text()
            .trim()
          const typeImg = $(row).find('td img').attr('src') || ''
          const isBaloto = typeImg.includes('baloto-kind.png')
          const isRevancha = typeImg.includes('revancha-kind.png')

          const tdNumeros = $(row).find('td').eq(2)
          const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
          const numbers = rawNumbers.match(/\d+/g) || []

          const fechaParsed = parseSpanishDate(date)
          const fechaStr = this.formatDate(fechaParsed)
          const tipo: Tipo | null = isBaloto
            ? 'baloto'
            : isRevancha
            ? 'revancha'
            : null

          if (!tipo) continue

          const existe = await this.sorteoRepository.findOne({
            where: { fecha: fechaStr, tipo },
          })

          if (!existe) {
            await this.sorteoRepository.save({
              fecha: fechaStr,
              tipo,
              numeros: numbers.slice(0, 5).map(Number),
              superbalota: Number(numbers[5]),
              fuente: url,
            })
          }
        }

        const nextBtn = $('a.btn.btn-yellow')
          .filter((_, el) => $(el).text().includes('Siguiente'))
          .attr('href')

        if (!nextBtn || !nextBtn.includes('?page=')) {
          this.logger.debug(`Fin detectado automaticamente en pagina ${page}.`)
          break
        }

        page++
      }

      this.lastScrapeTime = new Date()
      this.logger.log('Carga historica finalizada')
    } catch (error) {
      if (error instanceof HttpException) throw error
      this.logger.error('Error durante la carga historica', error.stack)
      if (axios.isAxiosError(error)) {
        if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)) {
          throw new ServiceUnavailableException('Sin conexion a internet')
        }
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con baloto.com',
      )
    }
  }
}
