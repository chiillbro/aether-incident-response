// import { Global, Module } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { BullModule } from '@nestjs/bullmq';
// import { NotificationsProcessor } from './notifications.processor';
// import { NotificationListener } from './notification.listener';


// export const NOTIFICATION_QUEUE = 'notification-queue'; // Queue name constant
// // @Global() // Make NotificationsService available globally without importing module explicitly
// @Module({
//   imports: [
//     ConfigModule,
//     BullModule.registerQueueAsync({
//       name: NOTIFICATION_QUEUE,
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => {
//         return {
//           connection: { // Connection options for Redis
//             host: configService.get<string>('REDIS_HOST'),
//             port: configService.get<number>('REDIS_PORT'),
//             // Add password if your Redis requires it
//             // password: configService.get<string>('REDIS_PASSWORD'),
//           },
//           // redis: {
//           //   host: configService.get<string>('REDIS_HOST'),
//           //   port: configService.get<number>('REDIS_PORT'),
//           //   password: configService.get<string>('REDIS_PASSWORD'),
//           // },
//           // Default job options (optional)
//          defaultJobOptions: {
//           attempts: 3, // Retry failed jobs 3 times
//           backoff: { type: 'exponential', delay: 1000 }, // Exponential backoff
//           removeOnComplete: true, // Clean up completed jobs
//           removeOnFail: 1000, // Keep failed jobs for a while
//        },
//         };
//       },
//       inject: [ConfigService],
//     }),
//     // --- ADD THIS ---
//     // Explicitly import the BullModule for the named queue again
//     // This ensures the injection token is clearly available within this module's context
//     // before providers like NotificationsService are instantiated.
//     BullModule.registerQueue({
//       name: NOTIFICATION_QUEUE,
//   }),
//   // -------------
//   ],
//   providers: [
//     NotificationsService,
//     NotificationsProcessor, // <-- Add NotificationProcessor if created
//     NotificationListener // <-- Provide the Listener
//   ],
//   exports: [NotificationsService] // Service still exported if needed elsewhere directly (less likely now)
// })
// export class NotificationsModule {}


// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { NotificationsProcessor } from './notifications.processor';
// import { NotificationListener } from './notification.listener';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
// No BullModule imports needed here anymore

export const NOTIFICATION_QUEUE = 'notification-queue';

console.log("token", getQueueToken(NOTIFICATION_QUEUE))

@Module({
  imports: [
    // REMOVE BullModule registrations from here
    // ConfigModule // Keep if needed directly by providers (unlikely now)
    // <-- THIS is what provides the BullQueue_<name> provider
    // BullModule.registerQueue({
    //   name: NOTIFICATION_QUEUE,
    // }),
    // BullModule.registerQueue({
    //   name: NOTIFICATION_QUEUE,
    //   defaultJobOptions: {
    //     attempts: 3,
    //     backoff: { type: 'exponential', delay: 1000 },
    //     removeOnComplete: true,
    //     removeOnFail: 1000,
    //   }
    // })
  ],
  providers: [
    // NotificationsService,
    // NotificationsProcessor,
    // NotificationListener,
  ],
  // exports: [NotificationsService,
  //   // getQueueToken(NOTIFICATION_QUEUE), // Explicitly export queue
  //   // BullModule

  // ],
})
export class NotificationsModule {}