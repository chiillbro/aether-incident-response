// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { NotificationsService } from './notifications.service';
// import { Incident, Task, User, Role } from '@prisma/client'; // Import needed types

// // Define payload types for events (can be more specific)
// export interface IncidentCreatedPayload { incident: Incident; creator: User; }
// export interface IncidentStatusUpdatedPayload { incidentId: string; oldStatus: string; newStatus: string; updatedByUser: User; incidentTitle: string; teamId: string; }
// export interface TaskCreatedPayload { task: Task & { assignee?: User | null }; incidentId: string; creator: User; }
// export interface TaskUpdatedPayload { task: Task & { assignee?: User | null }; incidentId: string; oldStatus?: string; updatedByUser: User; }
// export interface TaskAssignedPayload { task: Task & { assignee?: User | null }; incidentId: string; assigner: User; oldAssigneeId?: string | null; }
// export interface TaskDeletedPayload { taskId: string; incidentId: string; deletedByUser: User; }


// @Injectable()
// export class NotificationListener {
//     private readonly logger = new Logger(NotificationListener.name);

//     constructor(private notificationService: NotificationsService) {}

//     @OnEvent('incident.created')
//     async handleIncidentCreatedEvent(payload: IncidentCreatedPayload) {
//         this.logger.log(`Event 'incident.created' received for ID: ${payload.incident.id}`);
//         await this.notificationService.sendNotificationToTeam(
//             payload.incident.teamId,
//             payload.incident.title,
//             `New Incident "${payload.incident.title}" (Severity: ${payload.incident.severity}) reported by ${payload.creator.name} requires attention.`
//         );
//     }

//     @OnEvent('incident.status.updated')
//     async handleIncidentStatusUpdatedEvent(payload: IncidentStatusUpdatedPayload) {
//         this.logger.log(`Event 'incident.status.updated' received for ID: ${payload.incidentId}`);
//          await this.notificationService.sendNotificationToTeam(
//              payload.teamId,
//              payload.incidentTitle,
//              `Incident "${payload.incidentTitle}" status changed from ${payload.oldStatus} to ${payload.newStatus} by ${payload.updatedByUser.name}.`
//          );
//          // Potentially notify reporter or other stakeholders?
//     }

//     @OnEvent('task.created')
//     async handleTaskCreatedEvent(payload: TaskCreatedPayload) {
//        this.logger.log(`Event 'task.created' received for ID: ${payload.task.id}`);
//         if (payload.task.assigneeId && payload.task.assigneeId !== payload.creator.id) {
//              await this.notificationService.sendNotification(
//                  payload.task.assigneeId,
//                  `You have been assigned a new task for incident ${payload.incidentId}: "${payload.task.description}"`
//              );
//         }
//     }

//      @OnEvent('task.assigned')
//      async handleTaskAssignedEvent(payload: TaskAssignedPayload) {
//          this.logger.log(`Event 'task.assigned' received for ID: ${payload.task.id}`);
//          // Notify if assignment changed
//          if (payload.task.assigneeId !== payload.oldAssigneeId) {
//              if (payload.oldAssigneeId) { // Notify old assignee of unassignment
//                   await this.notificationService.sendNotification(
//                       payload.oldAssigneeId,
//                       `You have been unassigned from task "${payload.task.description}" for incident ${payload.incidentId}.`
//                   );
//              }
//              if (payload.task.assigneeId) { // Notify new assignee
//                   await this.notificationService.sendNotification(
//                       payload.task.assigneeId,
//                       `You have been assigned task "${payload.task.description}" for incident ${payload.incidentId}.`
//                   );
//              }
//          }
//      }

//      @OnEvent('task.status.updated')
//      async handleTaskStatusUpdatedEvent(payload: TaskUpdatedPayload) {
//          this.logger.log(`Event 'task.status.updated' received for ID: ${payload.task.id}`);
//          const message = `Task "${payload.task.description}" status changed to ${payload.task.status} for incident ${payload.incidentId}.`;
//          if (payload.task.assigneeId && payload.task.assigneeId !== payload.updatedByUser.id) { // Notify assignee if not self-update
//              await this.notificationService.sendNotification(payload.task.assigneeId, message);
//          }
//           // Could also notify reporter or team lead etc.
//      }

//      // Add listeners for other events like task.deleted if needed
// }