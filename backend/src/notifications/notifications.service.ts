// // src/notifications/notifications.service.ts
// import { getQueueToken, InjectQueue } from '@nestjs/bullmq';
// import { Injectable, Logger } from '@nestjs/common';
// import { NOTIFICATION_QUEUE } from './notifications.module';
// import { Queue } from 'bullmq';


// // Define structure of data passed to the queue job
// export interface NotificationJobData {
//     userId?: string; // For user-specific notifications
//     teamId?: string; // For team-specific notifications
//     title?: string; // Optional title
//     message: string;
//     type: 'user' | 'team' | 'broadcast'; // Type of notification
//   }

// @Injectable()
// export class NotificationsService {
//     private readonly logger = new Logger(NotificationsService.name);

//     constructor(
//         @InjectQueue(NOTIFICATION_QUEUE) 
//         private notificationQueue: Queue<NotificationJobData>,
//     // Inject UsersService/TeamsService if needed to resolve IDs to emails/etc. in the processor
//     ) {
//         console.log("token", getQueueToken(NOTIFICATION_QUEUE))
//     }

//      // Method called by other services to trigger a notification
//   async sendNotification(userId: string, message: string, title?: string): Promise<void> {
//     this.logger.log(`Queueing notification for User ID: ${userId} - ${message}`);
//     try {
//         // Add job to the queue
//         await this.notificationQueue.add('send-user-notification', {
//             userId,
//             message,
//             title,
//             type: 'user'
//         });
//     } catch (error) {
//         this.logger.error(`Failed to add user notification job to queue for user ${userId}: ${error.message}`, error.stack);
//         // Decide how to handle queue errors (e.g., fallback, alert)
//     }
//   }

//   // Method to notify all members of a specific team
//   async sendNotificationToTeam(teamId: string, title: string, message: string): Promise<void> {
//      this.logger.log(`Queueing notification for Team ID: ${teamId} - Title: ${title}`);
//      try {
//         await this.notificationQueue.add('send-team-notification', {
//            teamId,
//            title,
//            message,
//            type: 'team',
//         });
//      } catch (error) {
//         this.logger.error(`Failed to add team notification job to queue for team ${teamId}: ${error.message}`, error.stack);
//      }
//   }

//   // --- Actual Notification Sending Logic (Processor or Here if Simple) ---
//   // This is where you'd integrate with Email (SendGrid, SES), SMS (Twilio),
//   // or other notification services. For now, we just log.
//   // If using a processor, this logic moves there.
//   async processNotificationJob(jobData: NotificationJobData): Promise<void> {
//      this.logger.log(`Processing notification job: Type=${jobData.type}`, jobData);

//      if (jobData.type === 'user' && jobData.userId) {
//          // TODO: Fetch user's email/preferences from DB (requires UsersService)
//          // TODO: Integrate with email/SMS service
//          this.logger.log(`--> SIMULATING sending notification to User ${jobData.userId}: "${jobData.message}"`);
//      } else if (jobData.type === 'team' && jobData.teamId) {
//          // TODO: Fetch team members' emails/preferences from DB (requires TeamsService/UsersService)
//          // TODO: Iterate and send to each member (or use a group notification service)
//          this.logger.log(`--> SIMULATING sending notification to Team ${jobData.teamId}: "${jobData.message}"`);
//      } else if (jobData.type === 'broadcast') {
//           // TODO: Logic for broadcasting
//           this.logger.log(`--> SIMULATING sending broadcast: "${jobData.message}"`);
//      } else {
//          this.logger.warn('Unknown notification job type received', jobData);
//      }
//       // Simulate success
//       await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async work
//   }
//     // Simple simulation - logs to console
//     // async sendNotification(userId: string, message: string): Promise<void> {
//     //     this.logger.log(`SIMULATED NOTIFICATION for User ${userId}: ${message}`);

        
//     //     // In a real scenario, this would:
//     //     // 1. Add a job to a queue (BullMQ/Redis)
//     //     // 2. A worker process would pick up the job
//     //     // 3. The worker would send email, push notification, websocket message, etc.

//     //     await Promise.resolve(); // Simulate async operation
//     // }

//     // async sendNotificationToTeam(teamId: string, incidentTitle: string, message: string): Promise<void> {
//     //     this.logger.log(`SIMULATED TEAM NOTIFICATION for Team ${teamId} about Incident "${incidentTitle}": ${message}`);
//     //      // Would fetch team members and call sendNotification for each, or use team channels
//     //     await Promise.resolve();
//     // }
// }