export type Tipo = 'baloto' | 'revancha'

export interface SorteoDto {
  id: number
  fecha: string
  tipo: string
  numeros: number[]
  superbalota: number
  fuente?: string
  timestampGuardado: string
}

export interface SyncResponseDto {
  sorteos: SorteoDto[]
  syncedAt: string
  count: number
}

export interface SorteoConteo {
  numeros: Record<string, number>
  superbalotas: Record<string, number>
  totalSorteos: number
  topNumeros?: string[]
  topSuperbalotas?: string[]
}

export interface SorteoReciente {
  date: string
  numbers: number[]
}

export interface GeneratedTicket {
  numeros: string[]
  superbalota: string
}
