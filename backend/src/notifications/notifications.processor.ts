// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
// import { Job } from 'bullmq';
// import { NotificationJobData, NotificationsService } from './notifications.service'; // Inject service if needed for helper methods
// import { NOTIFICATION_QUEUE } from './notifications.module';
// import { Logger } from '@nestjs/common';

// @Processor(NOTIFICATION_QUEUE) // Decorate with the queue name
// export class NotificationsProcessor extends WorkerHost {
//     private readonly logger = new Logger(NotificationsProcessor.name);

//     // Inject NotificationsService or other services ONLY IF the processing logic needs them
//     constructor(private readonly notificationService: NotificationsService) {
//         super();
//     }

//     // This method will be called for each job in the queue
//     async process(job: Job<NotificationJobData, any, string>): Promise<any> {
//         this.logger.log(`Processing job ID: ${job.id}, Type: ${job.name}, Data:`, job.data);

//         try {
//             // Call the processing logic (moved from service or implemented here)
//              await this.notificationService.processNotificationJob(job.data); // Example call
//              this.logger.log(`Successfully processed job ID: ${job.id}`);
//              return { status: 'completed' }; // Optional return value
//         } catch (error) {
//             this.logger.error(`Failed to process job ID ${job.id}: ${error.message}`, error.stack);
//             // Throw error to make BullMQ handle retries based on job options
//             throw error;
//         }
//     }
//   @OnWorkerEvent('completed')
//   OnCompleted(job: Job<NotificationJobData>) {
//     this.logger.log(`Job completed: ${job.id}`);
//   }
// }