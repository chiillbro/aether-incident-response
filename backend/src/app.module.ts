import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { validationSchema } from './config/env.validation'; // Import the schema
import { PrismaModule } from 'prisma/prisma.module';
import { IncidentsModule } from './incidents/incidents.module';
import { MessagesModule } from './messages/messages.module';
import { EventsModule } from './events/events.module';
import { TeamsModule } from './teams/teams.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env', // Specify your env file
      validationSchema: validationSchema, // Apply validation
      // validationOptions: {
      //   allowUnknown: true, // Allow other env vars not defined in schema
      //   abortEarly: false, // Report all validation errors, not just the first
      // },
      // load: [configuration], // Optional: For custom config factories
    }),
    PrismaModule, // PrismaModule needs ConfigModule if it injects ConfigService
    AuthModule,
    UsersModule,
    IncidentsModule,
    MessagesModule,
    EventsModule,
    TeamsModule,
    TasksModule,
    NotificationsModule,
    // Add other modules (Incidents, Messages, etc.) later
  ],
  controllers: [AppController], // Root controllers if any
  providers: [AppService],   // Root providers if any
})
export class AppModule {}