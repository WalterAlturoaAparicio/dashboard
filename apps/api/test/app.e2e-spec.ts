import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { Repository } from 'typeorm'
import { Sorteo } from '../src/database/sorteo.entity'
import { AppController } from '../src/app.controller'
import { AnalysisModule } from '../src/analysis/analysis.module'
import { TicketModule } from '../src/ticket/ticket.module'
import { ConnectionModule } from '../src/connection/connection.module'
import { SyncModule } from '../src/sync/sync.module'
import { ScrapingModule } from '../src/scraping/scraping.module'
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter'

const seedData: Partial<Sorteo>[] = [
  {
    fecha: '2024-01-10' as unknown as Date,
    tipo: 'baloto',
    numeros: [3, 15, 22, 33, 41],
    superbalota: 7,
    fuente: 'test',
  },
  {
    fecha: '2024-01-13' as unknown as Date,
    tipo: 'baloto',
    numeros: [3, 10, 22, 35, 43],
    superbalota: 7,
    fuente: 'test',
  },
  {
    fecha: '2024-01-17' as unknown as Date,
    tipo: 'baloto',
    numeros: [5, 15, 22, 33, 40],
    superbalota: 12,
    fuente: 'test',
  },
  {
    fecha: '2024-01-10' as unknown as Date,
    tipo: 'revancha',
    numeros: [2, 8, 19, 27, 38],
    superbalota: 4,
    fuente: 'test',
  },
  {
    fecha: '2024-01-13' as unknown as Date,
    tipo: 'revancha',
    numeros: [6, 12, 25, 31, 44],
    superbalota: 9,
    fuente: 'test',
  },
]

describe('App (e2e)', () => {
  let app: INestApplication
  let sorteoRepo: Repository<Sorteo>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Sorteo],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Sorteo]),
        AnalysisModule,
        TicketModule,
        ConnectionModule,
        ScrapingModule,
        SyncModule,
      ],
      controllers: [AppController],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalFilters(new AllExceptionsFilter())
    await app.init()

    sorteoRepo = moduleFixture.get('SorteoRepository')
    await sorteoRepo.save(seedData)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/v1/conteo', () => {
    it('debe retornar conteo de frecuencias para baloto', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conteo?tipo=baloto')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalSorteos).toBe(3)
          expect(res.body.numeros).toBeDefined()
          expect(res.body.superbalotas).toBeDefined()
          expect(res.body.numeros['22']).toBe(3)
        })
    })

    it('debe retornar conteo para revancha', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conteo?tipo=revancha')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalSorteos).toBe(2)
        })
    })

    it('debe filtrar por fecha', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conteo?tipo=baloto&fecha=2024-01-12')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalSorteos).toBe(2)
        })
    })

    it('debe rechazar sin tipo', () => {
      return request(app.getHttpServer()).get('/api/v1/conteo').expect(400)
    })

    it('debe rechazar tipo invalido', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conteo?tipo=invalido')
        .expect(400)
    })

    it('debe rechazar fecha con formato invalido', () => {
      return request(app.getHttpServer())
        .get('/api/v1/conteo?tipo=baloto&fecha=15-01-2024')
        .expect(400)
    })
  })

  describe('GET /api/v1/recent-draws', () => {
    it('debe retornar sorteos recientes por defecto (3)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recent-draws?tipo=baloto')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(3)
          expect(res.body[0].numbers).toHaveLength(6)
        })
    })

    it('debe respetar el parametro cantidad', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recent-draws?tipo=baloto&cantidad=1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
        })
    })

    it('debe rechazar sin tipo', () => {
      return request(app.getHttpServer())
        .get('/api/v1/recent-draws')
        .expect(400)
    })
  })

  describe('GET /api/v1/generar', () => {
    it('debe generar tickets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/generar?tipo=baloto')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
          expect(res.body[0].numeros).toHaveLength(5)
          expect(res.body[0].superbalota).toBeDefined()
        })
    })

    it('debe generar multiples tickets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/generar?tipo=baloto&tickets=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(5)
        })
    })

    it('debe rechazar mas de 10 tickets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/generar?tipo=baloto&tickets=15')
        .expect(400)
    })
  })

  describe('GET /api/v1/status', () => {
    it('debe retornar online y lastScrape', () => {
      return request(app.getHttpServer())
        .get('/api/v1/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('online')
          expect(res.body).toHaveProperty('lastScrape')
          expect(typeof res.body.online).toBe('boolean')
        })
    })
  })

  describe('GET /api/v1/sync/sorteos', () => {
    it('debe rechazar sin parametro after', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sync/sorteos')
        .expect(400)
    })

    it('debe rechazar formato de fecha invalido', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sync/sorteos?after=fecha-invalida')
        .expect(400)
    })

    it('debe retornar sorteos y aplicar rate limit en segunda llamada', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/sync/sorteos?after=2000-01-01T00:00:00Z')
        .expect(200)

      expect(res.body.sorteos).toBeDefined()
      expect(res.body.syncedAt).toBeDefined()
      expect(res.body.count).toBe(5)

      // Segunda llamada inmediata: rate limit
      await request(app.getHttpServer())
        .get('/api/v1/sync/sorteos?after=2099-01-01T00:00:00Z')
        .expect(429)
    })
  })
})
