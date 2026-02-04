import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Sorteo } from '../database/sorteo.entity'
import { parseSpanishDate } from '../common/utils/date-parser'
import { Tipo } from '../common/types'

@Injectable()
export class ScrapingService {
  private readonly BASE_URL = 'https://baloto.com/resultados'
  private readonly logger = new Logger(ScrapingService.name)

  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) {}

  async getResultsFromAllPages(): Promise<void> {
    let page = 1
    let shouldContinue = true

    try {
      while (shouldContinue) {
        const url = `${this.BASE_URL}?page=${page}`
        this.logger.debug(`Procesando pagina ${page}: ${url}`)

        const { data: html } = await axios.get(url)
        const $ = cheerio.load(html)

        const rows = $('#results-table tbody tr').toArray()

        if (rows.length === 0) {
          this.logger.debug(`No hay mas resultados en la pagina ${page}.`)
          break
        }

        this.logger.debug(`Procesando pagina ${page} (${rows.length} filas)...`)

        for (const row of rows) {
          const date = $(row).find('.creation-date-results').first().text().trim()
          const typeImg = $(row).find('td img').attr('src') || ''
          const isBaloto = typeImg.includes('baloto-kind.png')
          const isRevancha = typeImg.includes('revancha-kind.png')

          const tdNumeros = $(row).find('td').eq(2)
          const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
          const numbers = rawNumbers.match(/\d+/g) || []

          const fechaActual = parseSpanishDate(date)
          const tipo: Tipo | null = isBaloto
            ? 'baloto'
            : isRevancha
              ? 'revancha'
              : null

          if (!tipo) continue

          const existe = await this.sorteoRepository.findOne({
            where: { fecha: fechaActual, tipo },
          })

          if (existe) {
            this.logger.debug(
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

          this.logger.debug(`Guardado: ${tipo} - ${fechaActual}`)
        }

        if (!shouldContinue) break

        page++
      }

      this.logger.log('Scraping completado.')
    } catch (error) {
      this.logger.error('Error durante el scraping', error.stack)
      throw new ServiceUnavailableException(
        'No se pudo conectar con baloto.com',
      )
    }
  }

  async loadHistoricalData(): Promise<void> {
    let page = 1

    try {
      while (true) {
        const url = `${this.BASE_URL}?page=${page}`
        this.logger.debug(`Cargando pagina historica ${page}: ${url}`)

        const { data: html } = await axios.get(url)
        const $ = cheerio.load(html)

        const rows = $('#results-table tbody tr').toArray()
        if (rows.length === 0) break

        for (const row of rows) {
          const date = $(row).find('.creation-date-results').first().text().trim()
          const typeImg = $(row).find('td img').attr('src') || ''
          const isBaloto = typeImg.includes('baloto-kind.png')
          const isRevancha = typeImg.includes('revancha-kind.png')

          const tdNumeros = $(row).find('td').eq(2)
          const rawNumbers = tdNumeros.text().replace(/\s+/g, '')
          const numbers = rawNumbers.match(/\d+/g) || []

          const fechaActual = parseSpanishDate(date)
          const tipo: Tipo | null = isBaloto
            ? 'baloto'
            : isRevancha
              ? 'revancha'
              : null

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

        const nextBtn = $('a.btn.btn-yellow')
          .filter((_, el) => $(el).text().includes('Siguiente'))
          .attr('href')

        const haySiguiente = nextBtn && nextBtn.includes('?page=')

        if (!haySiguiente) {
          this.logger.debug(`Fin detectado automaticamente en pagina ${page}.`)
          break
        }

        page++
      }

      this.logger.log('Carga historica finalizada')
    } catch (error) {
      this.logger.error('Error durante la carga historica', error.stack)
      throw new ServiceUnavailableException(
        'No se pudo conectar con baloto.com',
      )
    }
  }
}
