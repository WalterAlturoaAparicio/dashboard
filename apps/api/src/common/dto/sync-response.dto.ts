import { SorteoDto } from './sorteo.dto'

export interface SyncResponseDto {
  sorteos: SorteoDto[]
  syncedAt: string
  count: number
}
