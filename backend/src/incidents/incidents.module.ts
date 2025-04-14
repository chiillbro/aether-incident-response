import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
// AuthModule might be needed if guards aren't global
// import { AuthModule } from '../auth/auth.module';

@Module({
  // imports: [AuthModule], // Import if needed
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}