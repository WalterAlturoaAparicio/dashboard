import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { HttpException, HttpStatus } from '@nestjs/common'
import { SyncService } from './sync.service'
import { Sorteo } from '../database/sorteo.entity'

const mockSorteos: Partial<Sorteo>[] = [
  {
    id: 1,
    fecha: '2024-01-10',
    tipo: 'baloto',
    numeros: [3, 15, 22, 33, 41],
    superbalota: 7,
    timestampGuardado: new Date('2024-01-10T12:00:00Z'),
  },
  {
    id: 2,
    fecha: '2024-01-13',
    tipo: 'baloto',
    numeros: [3, 10, 22, 35, 43],
    superbalota: 7,
    timestampGuardado: new Date('2024-01-13T12:00:00Z'),
  },
]

describe('SyncService', () => {
  let service: SyncService
  let mockRepository: { find: jest.Mock }

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getRepositoryToken(Sorteo),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<SyncService>(SyncService)
  })

  describe('getSorteosAfter', () => {
    it('debe retornar sorteos despues de una fecha', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos)

      const result = await service.getSorteosAfter('2024-01-01T00:00:00Z')

      expect(result.sorteos).toHaveLength(2)
      expect(result.count).toBe(2)
      expect(result.syncedAt).toBeDefined()
    })

    it('debe retornar lista vacia si no hay sorteos nuevos', async () => {
      mockRepository.find.mockResolvedValue([])

      const result = await service.getSorteosAfter('2025-01-01T00:00:00Z')

      expect(result.sorteos).toHaveLength(0)
      expect(result.count).toBe(0)
    })

    it('debe usar MoreThan para la consulta', async () => {
      mockRepository.find.mockResolvedValue([])

      await service.getSorteosAfter('2024-01-12T00:00:00Z')

      const callArgs = mockRepository.find.mock.calls[0][0]
      expect(callArgs.where.timestampGuardado).toBeDefined()
      expect(callArgs.order.timestampGuardado).toBe('ASC')
    })
  })

  describe('rate limit', () => {
    it('debe permitir primera solicitud', () => {
      expect(() => service.checkRateLimit('127.0.0.1')).not.toThrow()
    })

    it('debe bloquear solicitudes repetidas', () => {
      service.markRequest('127.0.0.1')

      expect(() => service.checkRateLimit('127.0.0.1')).toThrow(HttpException)
    })

    it('debe retornar 429 con rate limit', () => {
      service.markRequest('192.168.1.1')

      try {
        service.checkRateLimit('192.168.1.1')
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
      }
    })

    it('debe permitir IPs diferentes', () => {
      service.markRequest('192.168.1.1')

      expect(() => service.checkRateLimit('192.168.1.2')).not.toThrow()
    })
  })
})
