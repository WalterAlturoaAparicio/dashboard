import { ValueTransformer } from 'typeorm'

export class JsonArrayTransformer implements ValueTransformer {
  to(value: number[]): string {
    return JSON.stringify(value)
  }

  from(value: string | number[]): number[] {
    if (typeof value === 'string') {
      return JSON.parse(value)
    }
    return value
  }
}
