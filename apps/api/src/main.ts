import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(morgan('combined'))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  })
  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`API running on port ${port}`)
}
bootstrap()
