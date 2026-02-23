import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class ConnectionService {
  private readonly logger = new Logger(ConnectionService.name)
  private online = true

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
}
