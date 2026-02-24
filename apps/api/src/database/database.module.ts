import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceOptions } from 'typeorm'
import { Sorteo } from './sorteo.entity'

const logger = new Logger('DatabaseModule')

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL')
        if (databaseUrl) {
          logger.log('Using DATABASE_URL (production mode, SSL enabled)')
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Sorteo],
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          }
        }
        const host = configService.get<string>('DB_HOST') || 'localhost'
        const port = configService.get<number>('DB_PORT') || 5432
        const database = configService.get<string>('DB_NAME') || 'baloto'
        logger.log(
          `Using individual vars (dev mode) → ${host}:${port}/${database}`,
        )
        return {
          type: 'postgres',
          host,
          port,
          username: configService.get<string>('DB_USER') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || '',
          database,
          entities: [Sorteo],
          synchronize: false,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
