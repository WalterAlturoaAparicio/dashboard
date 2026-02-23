import { Controller, Get, Query, Req, UsePipes } from '@nestjs/common'
import { Request } from 'express'
import { SyncService } from './sync.service'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { SyncQuerySchema, SyncQueryDto } from '../common/dto'

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('sorteos')
  @UsePipes(new ZodValidationPipe(SyncQuerySchema))
  async getSorteos(@Query() query: SyncQueryDto, @Req() req: Request) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    this.syncService.checkRateLimit(clientIp)
    const result = await this.syncService.getSorteosAfter(query.after)
    this.syncService.markRequest(clientIp)
    return result
  }
}
