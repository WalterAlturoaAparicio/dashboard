import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export type DbDriver = 'postgres' | 'sqlite'

@Injectable()
export class ConnectionService {
  private readonly logger = new Logger(ConnectionService.name)
  private online = true
  private readonly dbDriver: DbDriver

  constructor(private readonly configService: ConfigService) {
    this.dbDriver =
      (this.configService.get<string>('DB_DRIVER') as DbDriver) || 'sqlite'
  }

  async checkConnection(): Promise<boolean> {
    try {
      await axios.head('https://baloto.com', { timeout: 5000 })
      this.online = true
    } catch {
      this.online = false
    }
    return this.online
  }

  isOnline(): boolean {
    return this.online
  }

  getDbDriver(): DbDriver {
    return this.dbDriver
  }

  isServerMode(): boolean {
    return this.dbDriver === 'postgres'
  }

  isClientMode(): boolean {
    return this.dbDriver === 'sqlite'
  }
}
