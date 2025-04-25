// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Ensure ConfigService is imported
import { EventEmitterModule } from '@nestjs/event-emitter';

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
import { NotificationsModule } from './notifications/notifications.module'; // <-- Keep this import
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    // --- Add EventEmitterModule FIRST (or early) ---
    EventEmitterModule.forRoot({
      wildcard: false, // Default: false
      delimiter: '.', // Default: '.'
      newListener: false, // Default: false
      removeListener: false, // Default: false
      maxListeners: 10, // Default: 10
      verboseMemoryLeak: false, // Default: false
      ignoreErrors: false, // Default: false
    }),
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
    // BullModule.forRootAsync({ // Add global Bull configuration
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     connection: {
    //       host: configService.get('REDIS_HOST'),
    //       port: configService.get('REDIS_PORT'),
    //     }
    //   }),
    //   inject: [ConfigService]
    // }),
    // BullModule.forRoot({ connection: { host: 'redis', port: 6379 } }),


    PrismaModule,
    AuthModule,
    UsersModule,
    IncidentsModule,
    MessagesModule,
    EventsModule,
    TeamsModule,
    TasksModule,
    NotificationsModule, // Still need to import the module itself
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}