import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceOptions } from 'typeorm'
import { Sorteo } from './sorteo.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL')
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Sorteo],
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          }
        }
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get<string>('DB_USER') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_NAME') || 'baloto',
          entities: [Sorteo],
          synchronize: false,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
