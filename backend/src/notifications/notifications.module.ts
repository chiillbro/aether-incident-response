// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService, NotificationJobData } from './notifications.service'; // Export/Import interface here
import { NotificationsProcessor } from './notifications.processor';
import { NotificationListener } from './notification.listener';
import { BullModule } from '@nestjs/bullmq'; // Import BullModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule/Service
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { TeamsModule } from 'src/teams/teams.module';

export const NOTIFICATION_QUEUE = "notification-queue";
export { NotificationJobData }; // Re-export the interface

// Removed @Global()
@Module({
  imports: [
    ConfigModule,  
    RedisModule,
    PrismaModule,
    UsersModule,
    TeamsModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Make ConfigService available for the factory
    // --- Register the queue ONLY ONCE using Async ---
    BullModule.registerQueueAsync({
      name: NOTIFICATION_QUEUE,
      imports: [ConfigModule], // Make ConfigService available *within* useFactory
      useFactory: (configService: ConfigService) => ({
        connection: { // Connection options for Redis
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          // password: configService.get<string>('REDIS_PASSWORD'), // Uncomment if needed
        },
        defaultJobOptions: { // Default options for jobs added to THIS queue
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      }),
      inject: [ConfigService], // Inject ConfigService into the factory
    }),
    // BullModule.registerQueue({ name: 'notification-queue' }),

  ],
  providers: [
    NotificationsService,   // Depends on the Queue injected via @InjectQueue
    NotificationsProcessor, // Processes jobs from the Queue
    NotificationListener,   // Listens for app events and uses NotificationsService
  ],
  exports: [NotificationsService], // Export the service
})
export class NotificationsModule {}