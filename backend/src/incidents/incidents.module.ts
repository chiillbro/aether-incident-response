// import { Module } from '@nestjs/common';
// import { IncidentsService } from './incidents.service';
// import { IncidentsController } from './incidents.controller';
// // AuthModule might be needed if guards aren't global
// // import { AuthModule } from '../auth/auth.module';

// @Module({
//   // imports: [AuthModule], // Import if needed
//   controllers: [IncidentsController],
//   providers: [IncidentsService],
// })
// export class IncidentsModule {}


// src/incidents/incidents.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { EventsModule } from '../events/events.module'; // <-- Import EventsModule
// NotificationsModule is global
// import { NotificationsModule } from '../notifications/notifications.module';
 import { TeamsModule } from '../teams/teams.module'; // <-- Import TeamsModule
// import { TasksModule } from '../tasks/tasks.module'; // Only if service needs TasksService

@Module({
  imports: [
    PrismaModule,
    EventsModule, // Make EventsGateway available
    TeamsModule, // Make TeamsService available
    // forwardRef(() => TasksModule), // If IncidentsService needs TasksService
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService], // Export if needed by other modules (e.g., TasksService)
})
export class IncidentsModule {}