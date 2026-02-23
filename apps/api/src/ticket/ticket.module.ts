import { Module } from '@nestjs/common'
import { AnalysisModule } from '../analysis/analysis.module'
import { TicketService } from './ticket.service'

@Module({
  imports: [AnalysisModule],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
