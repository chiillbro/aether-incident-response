// @Module({
//   imports: [
//     // --- Add EventEmitterModule FIRST (or early) ---
//     EventEmitterModule.forRoot({
//       wildcard: false, // Default: false
//       delimiter: '.', // Default: '.'
//       newListener: false, // Default: false
//       removeListener: false, // Default: false
//       maxListeners: 10, // Default: 10
//       verboseMemoryLeak: false, // Default: false
//       ignoreErrors: false, // Default: false
//     }),
//     ConfigModule.forRoot({
//       isGlobal: true, // Make ConfigService available globally
//       envFilePath: '.env', // Specify your env file
//       validationSchema: validationSchema, // Apply validation
//       // validationOptions: {
//       //   allowUnknown: true, // Allow other env vars not defined in schema
//       //   abortEarly: false, // Report all validation errors, not just the first
//       // },
//       // load: [configuration], // Optional: For custom config factories
//     }),
//     PrismaModule, // PrismaModule needs ConfigModule if it injects ConfigService
//     AuthModule,
//     UsersModule,
//     IncidentsModule,
//     MessagesModule,
//     EventsModule,
//     TeamsModule,
//     TasksModule,
//     NotificationsModule,
//     // Add other modules (Incidents, Messages, etc.) later
//   ],
//   controllers: [AppController], // Root controllers if any
//   providers: [AppService],   // Root providers if any
// })
// export class AppModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Ensure ConfigService is imported
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq'; // <-- Import BullModule
import { NOTIFICATION_QUEUE } from './notifications/notifications.module'; // <-- Import constant

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
    // --- REGISTER BULL QUEUE HERE ---
    BullModule.forRootAsync({ // Use forRootAsync for global/app level config
         imports: [ConfigModule], // Make ConfigService available to factory
         useFactory: async (configService: ConfigService) => ({
             connection: {
                 host: configService.get<string>('REDIS_HOST'),
                 port: configService.get<number>('REDIS_PORT'),
                 // password: configService.get<string>('REDIS_PASSWORD'),
             },
         }),
         inject: [ConfigService],
     }),
    // BullModule.registerQueueAsync({
    //   name: NOTIFICATION_QUEUE,
    //   imports: [ConfigModule], // Also needs ConfigModule access if factory uses it
    //   useFactory: async (configService: ConfigService) => ({
    //     // connection is inherited from forRootAsync if setup there,
    //     // otherwise, define connection here as before:
    //     // connection: {
    //     //   host: configService.get<string>('REDIS_HOST'),
    //     //   port: configService.get<number>('REDIS_PORT'),
    //     // },
    //      defaultJobOptions: {
    //         attempts: 3,
    //         backoff: { type: 'exponential', delay: 1000 },
    //         removeOnComplete: true,
    //         removeOnFail: 1000,
    //      },
    //   }),
    //   inject: [ConfigService],
    // }),

    // --- TEMPORARY: Use synchronous registration ---
  //   BullModule.forRoot({
  //     connection: {
  //         host: process.env.REDIS_HOST || 'redis', // Get directly from process.env for test
  //         port: parseInt(process.env.REDIS_PORT || '6379', 10),
  //     },
  // }),
  // BullModule.registerQueue({
  //     name: NOTIFICATION_QUEUE,
  //     // Default job options can be set here too if needed
  //     defaultJobOptions: {
  //          attempts: 3,
  //          backoff: { type: 'exponential', delay: 1000 },
  //          removeOnComplete: true,
  //          removeOnFail: 1000,
  //     },
  // }),
  // --- END TEMPORARY ---
    // -----------------------------

    PrismaModule,
    AuthModule,
    UsersModule,
    IncidentsModule,
    MessagesModule,
    EventsModule,
    TeamsModule,
    TasksModule,
    NotificationsModule, // Still need to import the module itself
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}