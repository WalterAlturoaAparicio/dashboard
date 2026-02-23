import { Test, TestingModule } from '@nestjs/testing'
import { TicketService } from './ticket.service'
import { AnalysisService } from '../analysis/analysis.service'

const mockResumen = {
  totalSorteos: 100,
  numeros: {
    '1': 20,
    '5': 15,
    '10': 30,
    '15': 25,
    '20': 10,
    '25': 18,
    '30': 12,
    '35': 8,
    '40': 22,
    '43': 5,
  },
  superbalotas: {
    '1': 15,
    '3': 20,
    '7': 10,
    '12': 25,
    '16': 5,
  },
  topNumeros: ['10', '15', '40', '1', '25'],
  topSuperbalotas: ['12'],
}

describe('TicketService', () => {
  let service: TicketService
  let mockAnalysisService: { getResumen: jest.Mock }

  beforeEach(async () => {
    mockAnalysisService = {
      getResumen: jest.fn().mockResolvedValue(mockResumen),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: AnalysisService,
          useValue: mockAnalysisService,
        },
      ],
    }).compile()

    service = module.get<TicketService>(TicketService)
  })

  describe('generarTickets', () => {
    it('debe generar la cantidad solicitada de tickets', async () => {
      const tickets = await service.generarTickets('baloto', 3)
      expect(tickets).toHaveLength(3)
    })

    it('cada ticket debe tener 5 numeros y 1 superbalota', async () => {
      const tickets = await service.generarTickets('baloto', 1)
      const ticket = tickets[0]

      expect(ticket.numeros).toHaveLength(5)
      expect(ticket.superbalota).toBeDefined()
    })

    it('los numeros del ticket deben ser unicos', async () => {
      const tickets = await service.generarTickets('baloto', 5)

      for (const ticket of tickets) {
        const numerosSet = new Set(ticket.numeros)
        expect(numerosSet.size).toBe(5)
      }
    })

    it('los numeros del ticket deben estar ordenados', async () => {
      const tickets = await service.generarTickets('baloto', 5)

      for (const ticket of tickets) {
        const sorted = [...ticket.numeros].sort((a, b) => Number(a) - Number(b))
        expect(ticket.numeros).toEqual(sorted)
      }
    })

    it('debe usar numeros del pool de frecuencias', async () => {
      const tickets = await service.generarTickets('baloto', 1)
      const validNumbers = Object.keys(mockResumen.numeros)
      const validSuperbalotas = Object.keys(mockResumen.superbalotas)

      for (const num of tickets[0].numeros) {
        expect(validNumbers).toContain(num)
      }
      expect(validSuperbalotas).toContain(tickets[0].superbalota)
    })

    it('debe pasar fecha al AnalysisService cuando se proporciona', async () => {
      await service.generarTickets('baloto', 1, '2024-01-01')

      expect(mockAnalysisService.getResumen).toHaveBeenCalledWith(
        'baloto',
        '2024-01-01',
      )
    })

    it('debe generar un ticket por defecto', async () => {
      const tickets = await service.generarTickets('baloto', 1)
      expect(tickets).toHaveLength(1)
    })
  })
})
