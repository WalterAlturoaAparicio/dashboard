export interface SorteoDto {
  id: number
  fecha: string
  tipo: string
  numeros: number[]
  superbalota: number
  fuente?: string
  timestampGuardado: string
}
