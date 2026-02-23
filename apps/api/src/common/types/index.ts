export type Tipo = 'baloto' | 'revancha'

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
