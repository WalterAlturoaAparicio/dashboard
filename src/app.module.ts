import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { BalotoService } from './baloto.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [BalotoService],
})
export class AppModule {}
