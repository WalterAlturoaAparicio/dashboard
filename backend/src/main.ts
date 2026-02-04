import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(morgan('combined'))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  })
  await app.listen(3001)
}
bootstrap()
