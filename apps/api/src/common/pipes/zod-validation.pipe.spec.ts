import { BadRequestException } from '@nestjs/common'
import { ZodValidationPipe } from './zod-validation.pipe'
import { ConteoQuerySchema } from '../dto/conteo.dto'
import { GenerarQuerySchema } from '../dto/generar.dto'
import { RecentDrawsQuerySchema } from '../dto/recent-draws.dto'

describe('ZodValidationPipe', () => {
  const metadata = { type: 'query' as const, metatype: Object, data: '' }

  describe('ConteoQuerySchema', () => {
    const pipe = new ZodValidationPipe(ConteoQuerySchema)

    it('debe validar query correcto de conteo', () => {
      const result = pipe.transform({ tipo: 'baloto' }, metadata)
      expect(result.tipo).toBe('baloto')
    })

    it('debe validar con fecha opcional', () => {
      const result = pipe.transform(
        { tipo: 'revancha', fecha: '2024-01-15' },
        metadata,
      )
      expect(result.tipo).toBe('revancha')
      expect(result.fecha).toBe('2024-01-15')
    })

    it('debe rechazar tipo invalido', () => {
      expect(() => pipe.transform({ tipo: 'invalido' }, metadata)).toThrow(
        BadRequestException,
      )
    })

    it('debe rechazar sin tipo', () => {
      expect(() => pipe.transform({}, metadata)).toThrow(BadRequestException)
    })

    it('debe rechazar fecha con formato invalido', () => {
      expect(() =>
        pipe.transform({ tipo: 'baloto', fecha: '15-01-2024' }, metadata),
      ).toThrow(BadRequestException)
    })
  })

  describe('GenerarQuerySchema', () => {
    const pipe = new ZodValidationPipe(GenerarQuerySchema)

    it('debe validar con valores por defecto', () => {
      const result = pipe.transform({ tipo: 'baloto' }, metadata)
      expect(result.tipo).toBe('baloto')
      expect(result.tickets).toBe(1)
    })

    it('debe aceptar cantidad de tickets valida', () => {
      const result = pipe.transform({ tipo: 'baloto', tickets: '5' }, metadata)
      expect(result.tickets).toBe(5)
    })

    it('debe rechazar tickets mayor a 10', () => {
      expect(() =>
        pipe.transform({ tipo: 'baloto', tickets: '15' }, metadata),
      ).toThrow(BadRequestException)
    })

    it('debe rechazar tickets menor a 1', () => {
      expect(() =>
        pipe.transform({ tipo: 'baloto', tickets: '0' }, metadata),
      ).toThrow(BadRequestException)
    })
  })

  describe('RecentDrawsQuerySchema', () => {
    const pipe = new ZodValidationPipe(RecentDrawsQuerySchema)

    it('debe validar con cantidad por defecto', () => {
      const result = pipe.transform({ tipo: 'baloto' }, metadata)
      expect(result.cantidad).toBe(3)
    })

    it('debe aceptar cantidad valida', () => {
      const result = pipe.transform(
        { tipo: 'baloto', cantidad: '10' },
        metadata,
      )
      expect(result.cantidad).toBe(10)
    })

    it('debe rechazar cantidad mayor a 100', () => {
      expect(() =>
        pipe.transform({ tipo: 'baloto', cantidad: '150' }, metadata),
      ).toThrow(BadRequestException)
    })
  })

  describe('error format', () => {
    const pipe = new ZodValidationPipe(ConteoQuerySchema)

    it('debe incluir detalles de error en formato correcto', () => {
      try {
        pipe.transform({}, metadata)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
        const response = error.getResponse()
        expect(response.message).toBe('Error de validacion')
        expect(response.errors).toBeDefined()
        expect(Array.isArray(response.errors)).toBe(true)
        expect(response.errors[0]).toHaveProperty('field')
        expect(response.errors[0]).toHaveProperty('message')
      }
    })
  })
})
