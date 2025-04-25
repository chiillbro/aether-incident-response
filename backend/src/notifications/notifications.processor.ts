import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationJobData, NotificationsService } from './notifications.service'; // Inject service if needed for helper methods
import { NOTIFICATION_QUEUE } from './notifications.module';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RedisService } from 'src/redis/redis.service';
import { TeamsService } from 'src/teams/teams.service';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Processor('notification-queue') // Decorate with the queue name
export class NotificationsProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationsProcessor.name);

    // Inject NotificationsService or other services ONLY IF the processing logic needs them
    constructor(
        // private readonly notificationService: NotificationsService,
        private readonly redisService: RedisService, // <-- Inject RedisService
        private readonly teamsService: TeamsService,
        private readonly usersService: UsersService,
        private readonly prismaService: PrismaService
    ) {
        super();
    }

    // This method will be called for each job in the queue
    async process(job: Job<NotificationJobData, any, string>): Promise<any> {
        this.logger.log(`Processing job ID: ${job.id}, Type: ${job.name}, Data:`, job.data);

        const jobData = job.data;

        try {

            const notificationPayload = {
                title: jobData.title,
                message: jobData.message,
                type: jobData.type,
                timstamp: new Date().toISOString(),
            }

            if(jobData.type === 'user' && jobData.userId) {
                const channel = `user-notifications:${jobData.userId}`;
                await this.redisService.publish(channel, notificationPayload)
                this.logger.log(`Published notification to Redis channel: ${channel}`);

            } else if (jobData.type === 'team' && jobData.teamId) {

                this.logger.log(`Processing team notification for Team ID: ${jobData.teamId}`);

                // 1. Fetch team members
                let members: Pick<User, 'id'>[] = [];

                try {

                   // Safer: Use injected service if available
                    const fullMembers = await this.teamsService.findTeamMembers(jobData.teamId);
                    members = fullMembers.map(m => ({ id: m.id }));

                    // Use select to only get IDs, assuming findTeamMembers returns more
                    // Or add a specific service method like findTeamMemberIds
                    // members = await this.prismaService.user.findMany({
                    //     where: {
                    //         teamId: jobData.teamId,
                    //     },
                    //     select: {
                    //         id: true
                    //     }
                    // })

                    // members = await this.teamsService.findTeamMembers(jobData.teamId);
                } catch (error) {
                    this.logger.error(`Failed to fetch members for team ${jobData.teamId} during notification processing: ${error.message}`);
                    // Decide: Fail job? Log and continue?
                    throw error; // Fail job for now
                }

                this.logger.log(`Found ${members.length} members for team ${jobData.teamId}. Publishing individually...`);

                 // --- Filter out the actor ---
                 const recipients = members.filter(member => member.id !== jobData.actorId);
                 this.logger.log(`Found ${members.length} members, notifying ${recipients.length} recipients (excluding actor ${jobData.actorId || 'N/A'}).`);
                 // ---------------------------
                
                const publishPromises = recipients.map(recipient => {
                    const userChannel = `user-notifications:${recipient.id}`;
                    return this.redisService.publish(userChannel, notificationPayload);
                })

                await Promise.all(publishPromises);
                this.logger.log(`Published TEAM notification to ${recipients.length} user channels for team ${jobData.teamId}`);

                // Optional: Also publish to a team-specific channel if needed (e.g., for a team dashboard)
                // const teamChannel = `team-notifications:${jobData.teamId}`;
                // await this.redisService.publish(teamChannel, notificationPayload);

                 // TODO: Fetch team members via TeamsService/UsersService and publish to each user's channel or use email/SMS
            } else if (jobData.type === 'broadcast') {
                this.logger.log(`Processing BROADCAST notification.`);
                const broadcastChannel = `broadcast-notifications`;

                // Publish to the general broadcast channel
                await this.redisService.publish(broadcastChannel, notificationPayload);
                this.logger.log(`Published notification to Redis channel: ${broadcastChannel}`);
                // Note: Handling broadcast efficiently on the frontend requires all users to subscribe to this channel.

                 // TODO: Publish to a general broadcast channel?
            } else {
                 this.logger.warn('Unknown notification job type received', jobData);
            }
            // ----------------------------------------------------------

            this.logger.log(`Successfully processed job ID: ${job.id}`);
            return { status: 'completed' };
            // Call the processing logic (moved from service or implemented here)
            //  await this.notificationService.processNotificationJob(job.data); // Example call

        } catch (error) {
            this.logger.error(`Failed to process job ID ${job.id}: ${error.message}`, error.stack);
            // Throw error to make BullMQ handle retries based on job options
            throw error;
        }
    }
  @OnWorkerEvent('completed')
  OnCompleted(job: Job<NotificationJobData>) {
    this.logger.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NotificationJobData>, error: Error) {
      this.logger.error(`Job failed: ${job.id} - ${job.name}. Error: ${error.message}`, error.stack);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<NotificationJobData>) {
      this.logger.log(`Job active: ${job.id} - ${job.name}`);
  }
}