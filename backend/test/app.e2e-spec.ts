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
import { ScrapingModule } from '../src/scraping/scraping.module'
import { ConnectionModule } from '../src/connection/connection.module'
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter'

const seedData: Partial<Sorteo>[] = [
  {
    fecha: '2024-01-10',
    tipo: 'baloto',
    numeros: [3, 15, 22, 33, 41],
    superbalota: 7,
    fuente: 'test',
  },
  {
    fecha: '2024-01-13',
    tipo: 'baloto',
    numeros: [3, 10, 22, 35, 43],
    superbalota: 7,
    fuente: 'test',
  },
  {
    fecha: '2024-01-17',
    tipo: 'baloto',
    numeros: [5, 15, 22, 33, 40],
    superbalota: 12,
    fuente: 'test',
  },
  {
    fecha: '2024-01-10',
    tipo: 'revancha',
    numeros: [2, 8, 19, 27, 38],
    superbalota: 4,
    fuente: 'test',
  },
  {
    fecha: '2024-01-13',
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
        ScrapingModule,
        ConnectionModule,
      ],
      controllers: [AppController],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalFilters(new AllExceptionsFilter())
    await app.init()

    sorteoRepo = moduleFixture.get('SorteoRepository')
    await sorteoRepo.save(seedData)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /conteo', () => {
    it('debe retornar conteo de frecuencias para baloto', () => {
      return request(app.getHttpServer())
        .get('/conteo?tipo=baloto')
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
        .get('/conteo?tipo=revancha')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalSorteos).toBe(2)
        })
    })

    it('debe filtrar por fecha', () => {
      return request(app.getHttpServer())
        .get('/conteo?tipo=baloto&fecha=2024-01-12')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalSorteos).toBe(2) // solo 13 y 17
        })
    })

    it('debe rechazar sin tipo', () => {
      return request(app.getHttpServer()).get('/conteo').expect(400)
    })

    it('debe rechazar tipo invalido', () => {
      return request(app.getHttpServer())
        .get('/conteo?tipo=invalido')
        .expect(400)
    })

    it('debe rechazar fecha con formato invalido', () => {
      return request(app.getHttpServer())
        .get('/conteo?tipo=baloto&fecha=15-01-2024')
        .expect(400)
    })
  })

  describe('GET /recent-draws', () => {
    it('debe retornar sorteos recientes por defecto (3)', () => {
      return request(app.getHttpServer())
        .get('/recent-draws?tipo=baloto')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(3)
          // Los numeros deben incluir superbalota (6 numeros total)
          expect(res.body[0].numbers).toHaveLength(6)
        })
    })

    it('debe respetar el parametro cantidad', () => {
      return request(app.getHttpServer())
        .get('/recent-draws?tipo=baloto&cantidad=1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
        })
    })

    it('debe rechazar sin tipo', () => {
      return request(app.getHttpServer()).get('/recent-draws').expect(400)
    })
  })

  describe('GET /generar', () => {
    it('debe generar tickets de baloto', () => {
      return request(app.getHttpServer())
        .get('/generar?tipo=baloto')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
          expect(res.body[0].numeros).toHaveLength(5)
          expect(res.body[0].superbalota).toBeDefined()
        })
    })

    it('debe generar multiples tickets', () => {
      return request(app.getHttpServer())
        .get('/generar?tipo=baloto&tickets=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(5)
        })
    })

    it('debe rechazar mas de 10 tickets', () => {
      return request(app.getHttpServer())
        .get('/generar?tipo=baloto&tickets=15')
        .expect(400)
    })
  })

  describe('GET /status', () => {
    it('debe retornar el estado de conexion', () => {
      return request(app.getHttpServer())
        .get('/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('online')
          expect(res.body).toHaveProperty('lastScrape')
          expect(typeof res.body.online).toBe('boolean')
        })
    })
  })
})
