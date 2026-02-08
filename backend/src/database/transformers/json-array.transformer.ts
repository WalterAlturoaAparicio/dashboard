import { ValueTransformer } from 'typeorm'

export class JsonArrayTransformer implements ValueTransformer {
  to(value: number[] | null): string | null {
    if (!value) return null
    return JSON.stringify(value)
  }

  from(value: string | number[] | null): number[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    // PostgreSQL native array format: {1,2,3,4,5}
    if (typeof value === 'string' && value.startsWith('{')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((n) => Number(n.trim()))
    }
    // JSON format: [1,2,3,4,5]
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
}
