import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import { Sorteo } from '../database/sorteo.entity'
import { ConnectionService } from '../connection/connection.service'

@Injectable()
export class SyncClientService implements OnModuleInit {
  private readonly logger = new Logger(SyncClientService.name)
  private readonly serverUrl: string
  private syncing = false
  private lastSyncedAt: string | null = null
  private syncInterval: ReturnType<typeof setInterval> | null = null

  constructor(
    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
    private readonly connectionService: ConnectionService,
    private readonly configService: ConfigService,
  ) {
    this.serverUrl =
      this.configService.get<string>('SYNC_SERVER_URL') ||
      'http://localhost:3001'
  }

  async onModuleInit() {
    await this.loadLastSyncedAt()
    // Intentar sync inicial
    await this.trySync()
    // Polling cada 10 minutos
    this.syncInterval = setInterval(() => this.trySync(), 10 * 60 * 1000)
  }

  getLastSyncedAt(): string | null {
    return this.lastSyncedAt
  }

  isSyncing(): boolean {
    return this.syncing
  }

  private async loadLastSyncedAt(): Promise<void> {
    const latest = await this.sorteoRepository
      .createQueryBuilder('sorteo')
      .select('MAX(sorteo.timestamp_guardado)', 'maxTs')
      .getRawOne()

    this.lastSyncedAt = latest?.maxTs || null
    this.logger.log(`Ultimo sync local: ${this.lastSyncedAt || 'nunca'}`)
  }

  async trySync(): Promise<{ inserted: number; error?: string }> {
    if (this.syncing) {
      return { inserted: 0, error: 'Sync en progreso' }
    }

    const online = await this.connectionService.checkConnection()
    if (!online) {
      this.logger.debug('Sin conexion, omitiendo sync')
      return { inserted: 0, error: 'Sin conexion' }
    }

    this.syncing = true
    try {
      const after = this.lastSyncedAt || '2000-01-01T00:00:00.000Z'
      const { data } = await axios.get(
        `${this.serverUrl}/sync/sorteos?after=${encodeURIComponent(after)}`,
        { timeout: 15_000 },
      )

      let inserted = 0
      for (const sorteo of data.sorteos) {
        const exists = await this.sorteoRepository.findOne({
          where: { fecha: sorteo.fecha, tipo: sorteo.tipo },
        })

        if (!exists) {
          await this.sorteoRepository.save({
            fecha: sorteo.fecha,
            tipo: sorteo.tipo,
            numeros: sorteo.numeros,
            superbalota: sorteo.superbalota,
            fuente: 'sync',
          })
          inserted++
        }
      }

      this.lastSyncedAt = data.syncedAt
      this.logger.log(`Sync completado: ${inserted} sorteos nuevos insertados`)
      return { inserted }
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.message
        : 'Error desconocido'
      this.logger.warn(`Error en sync: ${msg}`)
      return { inserted: 0, error: msg }
    } finally {
      this.syncing = false
    }
  }
}
