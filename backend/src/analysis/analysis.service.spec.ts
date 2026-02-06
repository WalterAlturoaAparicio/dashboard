import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AnalysisService } from './analysis.service'
import { Sorteo } from '../database/sorteo.entity'

const mockSorteos: Partial<Sorteo>[] = [
  {
    id: 1,
    fecha: '2024-01-10',
    tipo: 'baloto',
    numeros: [3, 15, 22, 33, 41],
    superbalota: 7,
  },
  {
    id: 2,
    fecha: '2024-01-13',
    tipo: 'baloto',
    numeros: [3, 10, 22, 35, 43],
    superbalota: 7,
  },
  {
    id: 3,
    fecha: '2024-01-17',
    tipo: 'baloto',
    numeros: [5, 15, 22, 33, 40],
    superbalota: 12,
  },
]

describe('AnalysisService', () => {
  let service: AnalysisService
  let mockRepository: {
    find: jest.Mock
    findOne: jest.Mock
  }

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: getRepositoryToken(Sorteo),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<AnalysisService>(AnalysisService)
  })

  describe('getResumen', () => {
    it('debe contar frecuencias de numeros correctamente', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos)

      const result = await service.getResumen('baloto')

      expect(result.totalSorteos).toBe(3)
      // 22 aparece 3 veces
      expect(result.numeros['22']).toBe(3)
      // 3 aparece 2 veces
      expect(result.numeros['3']).toBe(2)
      // 15 aparece 2 veces
      expect(result.numeros['15']).toBe(2)
      // 33 aparece 2 veces
      expect(result.numeros['33']).toBe(2)
      // 5 aparece 1 vez
      expect(result.numeros['5']).toBe(1)
    })

    it('debe contar frecuencias de superbalotas correctamente', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos)

      const result = await service.getResumen('baloto')

      expect(result.superbalotas['7']).toBe(2)
      expect(result.superbalotas['12']).toBe(1)
    })

    it('debe retornar top numeros mas frecuentes', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos)

      const result = await service.getResumen('baloto')

      expect(result.topNumeros).toBeDefined()
      expect(result.topNumeros).toContain('22')
    })

    it('debe retornar superbalotas mas frecuentes', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos)

      const result = await service.getResumen('baloto')

      expect(result.topSuperbalotas).toContain('7')
    })

    it('debe aplicar filtro de fecha cuando se proporciona', async () => {
      mockRepository.find.mockResolvedValue([])

      await service.getResumen('baloto', '2024-01-15')

      const callArgs = mockRepository.find.mock.calls[0][0]
      expect(callArgs.where.tipo).toBe('baloto')
      expect(callArgs.where.fecha).toBeDefined()
    })

    it('debe manejar lista vacia de sorteos', async () => {
      mockRepository.find.mockResolvedValue([])

      const result = await service.getResumen('baloto')

      expect(result.totalSorteos).toBe(0)
      expect(result.numeros).toEqual({})
      expect(result.superbalotas).toEqual({})
    })
  })

  describe('getRecientes', () => {
    it('debe retornar sorteos recientes formateados', async () => {
      mockRepository.find.mockResolvedValue(mockSorteos.slice(0, 2))

      const result = await service.getRecientes('baloto', 2)

      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2024-01-10')
      expect(result[0].numbers).toEqual([3, 15, 22, 33, 41, 7])
    })

    it('debe incluir superbalota en el array de numbers', async () => {
      mockRepository.find.mockResolvedValue([mockSorteos[0]])

      const result = await service.getRecientes('baloto', 1)

      expect(result[0].numbers).toHaveLength(6)
      expect(result[0].numbers[5]).toBe(7)
    })
  })

  describe('getTopFrecuentes', () => {
    it('debe retornar los N numeros mas frecuentes', () => {
      const conteo = { '1': 10, '2': 8, '3': 5, '4': 3, '5': 1 }
      const result = service.getTopFrecuentes(conteo, 3)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe('1')
    })

    it('debe incluir empates', () => {
      const conteo = { '1': 10, '2': 10, '3': 5, '4': 5, '5': 1 }
      const result = service.getTopFrecuentes(conteo, 3)

      // top 3 pero hay empate en posicion 3-4, se incluyen ambos
      expect(result).toContain('1')
      expect(result).toContain('2')
      expect(result).toContain('3')
      expect(result).toContain('4')
    })

    it('debe manejar conteo vacio', () => {
      const result = service.getTopFrecuentes({}, 5)
      expect(result).toEqual([])
    })
  })

  describe('getMasFrecuentes', () => {
    it('debe retornar numeros con la frecuencia maxima', () => {
      const conteo = { '1': 10, '2': 10, '3': 5 }
      const result = service.getMasFrecuentes(conteo)

      expect(result).toEqual(['1', '2'])
    })

    it('debe manejar conteo vacio', () => {
      const result = service.getMasFrecuentes({})
      expect(result).toEqual([])
    })
  })
})
