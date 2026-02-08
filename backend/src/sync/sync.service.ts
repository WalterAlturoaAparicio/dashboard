import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { Sorteo } from '../database/sorteo.entity'

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)
  private readonly requestTimestamps = new Map<string, number>()
  private readonly RATE_LIMIT_MS = 5 * 60 * 1000 // 5 minutos

  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) {}

  checkRateLimit(clientIp: string): void {
    const last = this.requestTimestamps.get(clientIp)
    if (last) {
      const elapsed = Date.now() - last
      if (elapsed < this.RATE_LIMIT_MS) {
        const seconds = Math.ceil((this.RATE_LIMIT_MS - elapsed) / 1000)
        throw new HttpException(
          `Sync disponible en ${seconds} segundo(s)`,
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }
    }
  }

  async getSorteosAfter(after: string): Promise<{
    sorteos: Sorteo[]
    syncedAt: string
    count: number
  }> {
    const sorteos = await this.sorteoRepository.find({
      where: { timestampGuardado: MoreThan(new Date(after)) },
      order: { timestampGuardado: 'ASC' },
    })

    this.logger.log(`Sync: ${sorteos.length} sorteos nuevos desde ${after}`)

    return {
      sorteos,
      syncedAt: new Date().toISOString(),
      count: sorteos.length,
    }
  }

  markRequest(clientIp: string): void {
    this.requestTimestamps.set(clientIp, Date.now())
  }
}
