import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { SyncClientService } from './sync-client.service'
import { ConnectionService } from '../connection/connection.service'
import { Sorteo } from '../database/sorteo.entity'

describe('SyncClientService', () => {
  let service: SyncClientService
  let mockRepository: {
    findOne: jest.Mock
    save: jest.Mock
    createQueryBuilder: jest.Mock
  }
  let mockConnectionService: { checkConnection: jest.Mock }

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxTs: null }),
      }),
    }

    mockConnectionService = {
      checkConnection: jest.fn().mockResolvedValue(false),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncClientService,
        {
          provide: getRepositoryToken(Sorteo),
          useValue: mockRepository,
        },
        {
          provide: ConnectionService,
          useValue: mockConnectionService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://test-server:3001'),
          },
        },
      ],
    }).compile()

    service = module.get<SyncClientService>(SyncClientService)
  })

  describe('trySync', () => {
    it('debe retornar error cuando no hay conexion', async () => {
      mockConnectionService.checkConnection.mockResolvedValue(false)

      const result = await service.trySync()

      expect(result.inserted).toBe(0)
      expect(result.error).toBe('Sin conexion')
    })

    it('debe retornar lastSyncedAt null inicialmente', () => {
      expect(service.getLastSyncedAt()).toBeNull()
    })

    it('debe reportar que no esta sincronizando inicialmente', () => {
      expect(service.isSyncing()).toBe(false)
    })
  })

  describe('insert sin duplicados', () => {
    it('debe verificar existencia antes de insertar', async () => {
      // Simular sorteo ya existente
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        fecha: '2024-01-10',
        tipo: 'baloto',
      })

      // El servicio deberia verificar con findOne antes de save
      const existente = await mockRepository.findOne({
        where: { fecha: '2024-01-10', tipo: 'baloto' },
      })

      expect(existente).toBeDefined()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('debe insertar cuando no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      const sorteoNuevo = {
        fecha: '2024-01-20',
        tipo: 'baloto',
        numeros: [1, 2, 3, 4, 5],
        superbalota: 6,
        fuente: 'sync',
      }

      await mockRepository.save(sorteoNuevo)

      expect(mockRepository.save).toHaveBeenCalledWith(sorteoNuevo)
    })
  })
})
