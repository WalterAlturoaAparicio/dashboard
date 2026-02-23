import { ValueTransformer } from 'typeorm'

/**
 * Transforma number[] ↔ TEXT para compatibilidad con PostgreSQL y SQLite.
 *
 * - PostgreSQL (sin synchronize): la columna física es integer[] — TypeORM
 *   ya deserializa los arrays nativos como JS arrays antes de llamar al
 *   transformer, por lo que `from([3,15,...])` devuelve el array tal cual.
 * - SQLite (para tests): almacena JSON '["3","15",...]' y lo recupera.
 * - Formato nativo PG '{3,15,22}' si el driver lo expone como string.
 */
export class NumericArrayTransformer implements ValueTransformer {
  to(value: number[] | null): string | null {
    if (!value) return null
    return JSON.stringify(value)
  }

  from(value: string | number[] | null): number[] {
    if (!value) return []
    if (Array.isArray(value)) return value.map(Number)
    if (typeof value === 'string') {
      if (value.startsWith('{')) {
        // Formato nativo PostgreSQL: {3,15,22,33,41}
        return value
          .slice(1, -1)
          .split(',')
          .map((n) => Number(n.trim()))
          .filter((n) => !isNaN(n))
      }
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed.map(Number) : []
      } catch {
        return []
      }
    }
    return []
  }
}
