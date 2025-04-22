// src/tasks/tasks.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { EventsModule } from '../events/events.module'; // Import EventsModule
// NotificationsModule is global, no need to import typically
// import { NotificationsModule } from '../notifications/notifications.module';
import { IncidentsModule } from '../incidents/incidents.module'; // Import IncidentsModule for service dependency
 import { UsersModule } from '../users/users.module'; // Import UsersModule
// import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    // PrismaModule,
    EventsModule, // Make EventsGateway available
    // forwardRef is needed if IncidentsService injects TasksService AND TasksService injects IncidentsService
    forwardRef(() => IncidentsModule), // Handle circular dependency: TaskService -> IncidentsService
    UsersModule, // Make UsersService available
    // NotificationsModule, // Make NotificationsService available
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // Export if needed elsewhere
})
export class TasksModule {}