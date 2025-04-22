// src/tasks/tasks.service.ts
import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Task, User, Role, TaskStatus } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { EventsGateway } from '../events/events.gateway'; // Import Gateway
// import { NotificationsService } from '../notifications/notifications.service'; // Import NotificationsService
import { IncidentsService } from '../incidents/incidents.service'; // To check incident access
import { UsersService } from 'src/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';


// --- Define more specific return types for the helper ---
type CheckResultIncident = { type: 'incident', incidentId: string; incidentTeamId: string; };
// Include assignee in the Task returned by the helper if needed downstream
type TaskWithAssignee = Task & { assignee: { id: string, name: string } | null };
type TaskWithIncident = Task & { incident: { id: string, teamId: string } };
type CheckResultTask = { type: 'task', incidentId: string; incidentTeamId: string; task: TaskWithIncident }; // Return the task itself


@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, // Inject Gateway
    // private notificationService: NotificationsService, // Inject Notifications
    private emitter2: EventEmitter2,
    @Inject(forwardRef(() => IncidentsService)) // Handle circular dependency if needed
    private incidentsService: IncidentsService,
    private usersService: UsersService, // Inject UsersService to check assignee existence
  ) {}

  // --- Permission Helper ---
  private async checkIncidentAndTaskPermission(taskIdOrIncidentId: string, user: User, checkType: 'incident'): 
  Promise<CheckResultIncident>;
  private async checkIncidentAndTaskPermission(
    taskIdOrIncidentId: string,
    user: User,
    checkType: 'task'
): Promise<CheckResultTask>; // Overload signature for 'task'
private async checkIncidentAndTaskPermission(
  taskIdOrIncidentId: string,
  user: User,
  checkType: 'incident' | 'task'
): Promise<CheckResultIncident | CheckResultTask> {
     let incidentId;
     let incidentTeamId: string;
     let task: TaskWithIncident | null = null;


     if (checkType === 'task') {
         task = await this.prisma.task.findUnique({
             where: { id: taskIdOrIncidentId },
             include: { incident: { select: { id: true, teamId: true } } },
         });
         if (!task) throw new NotFoundException(`Task with ID "${taskIdOrIncidentId}" not found.`);
         if (!task.incident) throw new NotFoundException(`Incident associated with task "${taskIdOrIncidentId}" not found (data integrity issue).`);
         incidentId = task.incident.id;
          incidentTeamId = task.incident.teamId;

     } else { // 'incident'
          // Use incidentsService to check access, it handles its own NotFound
          const fullIncident = await this.incidentsService.findOneById(taskIdOrIncidentId, user, true); // Bypass perm check within incidentsService here
          incidentId = fullIncident.id;
          incidentTeamId = fullIncident.teamId;
     }


     // Authorization Check: User must be ADMIN or belong to the incident's team
     if (user.role !== Role.ADMIN && incidentTeamId !== user.teamId) {
         throw new ForbiddenException(`User not authorized for incident ${incidentId} (Team mismatch)`);
     }

     if (checkType === 'task') {
      // We already established task is not null here
     return { type: 'task', incidentId, incidentTeamId, task: task! }; // Use non-null assertion as we checked above
    } else {
     return { type: 'incident', incidentId, incidentTeamId };
    }
  }


  // --- CRUD Methods ---

  async create(incidentId: string, createTaskDto: CreateTaskDto, creator: User): Promise<Task> {
     await this.checkIncidentAndTaskPermission(incidentId, creator, 'incident');

     // Optional: Check if assigneeId exists if provided
     if (createTaskDto.assigneeId) {
         try {
             await this.usersService.findOneById(createTaskDto.assigneeId);
         } catch (error) {
             throw new NotFoundException(`Assignee user with ID "${createTaskDto.assigneeId}" not found.`);
         }
     }

     const taskData: Prisma.TaskCreateInput = {
         description: createTaskDto.description,
         incident: { connect: { id: incidentId } }, // Connect to the incident
         status: TaskStatus.TODO, // Default status
         assignee: createTaskDto.assigneeId
             ? { connect: { id: createTaskDto.assigneeId } }
             : undefined,
     };

     const newTask = await this.prisma.task.create({
         data: taskData,
         include: { assignee: { select: { id: true, name: true } } }, // Include assignee for event payload
     });

     // Emit WebSocket event
     this.eventsGateway.emitTaskCreated(incidentId, {...newTask, owner: creator.id});

     // Send notification if assigned
     if (newTask.assigneeId) {
        //  this.notificationService.sendNotification(
        //      newTask.assigneeId,
        //      `You have been assigned a new task for incident ${incidentId}: "${newTask.description}"`
        //  );

        this.emitter2.emit('task.created', {task: newTask, incidentId, creator}); // Emit event to all listeners
     }

     return newTask;
  }

  async findByIncident(incidentId: string, user: User): Promise<Task[]> {
     // Permission check is implicitly handled by checking incident access first
     await this.checkIncidentAndTaskPermission(incidentId, user, 'incident');

     return this.prisma.task.findMany({
         where: { incidentId },
         orderBy: { createdAt: 'asc' },
         include: {
             assignee: { select: { id: true, name: true } }, // Include assignee details
         },
     });
  }


  // --- FIX: Simplified findOne using refined helper ---
  async findOne(taskId: string, user: User): Promise<Task> {
    const checkResult = await this.checkIncidentAndTaskPermission(taskId, user, 'task');

     // The helper already throws if not found or no permission, and returns the task
        // We might need to fetch relations again if the helper didn't include them
        return this.prisma.task.findUniqueOrThrow({ // Use findUniqueOrThrow for simplicity here
          where: { id: taskId },
          include: { assignee: { select: { id: true, name: true } } } // Ensure needed relations are included
      });

     // return checkResult.task; // This task only has incident relation from helper include
    //  // Load assignee again if needed (or ensure include in check)
    //  return this.prisma.task.findUnique({
    //      where: { id: taskId },
    //       include: { assignee: { select: { id: true, name: true } } }
    //  });
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    // --- FIX: Use destructured task from helper ---
     const { incidentId, task: originalTask } = await this.checkIncidentAndTaskPermission(taskId, user, 'task');

      // originalTask is guaranteed to be defined here if no exception was thrown
     const updatedTask = await this.prisma.task.update({
         where: { id: taskId },
         data: {
             description: updateTaskDto.description,
             status: updateTaskDto.status,
             // Assignment is handled separately
         },
         include: { assignee: { select: { id: true, name: true } } },
     });

     // Emit WebSocket event
     this.eventsGateway.emitTaskUpdated(incidentId, updatedTask);

     // Basic notification on status change
     if (updateTaskDto.status && updateTaskDto.status !== originalTask.status) {
         const message = `Task "${updatedTask.description}" status changed to ${updatedTask.status} for incident ${incidentId}.`;
         if (updatedTask.assigneeId && updatedTask.assigneeId !== user.id) { // Notify assignee if not self-update
            //  this.notificationService.sendNotification(updatedTask.assigneeId, message);

            this.emitter2.emit('task.status.updated', {task: updatedTask, incidentId, oldStatus: originalTask.status, updatedByUser: user}); // Emit event to all listeners
         }
         // Could also notify reporter or team lead etc.
     }

     return updatedTask;
  }

  async assign(taskId: string, assignTaskDto: AssignTaskDto, user: User): Promise<Task> {

     // --- FIX: Use destructured task from helper ---
     const { incidentId, task: originalTask } = await this.checkIncidentAndTaskPermission(taskId, user, 'task');
     const { assigneeId } = assignTaskDto; // Can be string (UUID) or null/undefined

     // Validate assignee exists if assigning (not null/undefined)
     if (assigneeId) {
         try {
             await this.usersService.findOneById(assigneeId);
         } catch (error) {
             throw new NotFoundException(`Assignee user with ID "${assigneeId}" not found.`);
         }
     }

     const updatedTask = await this.prisma.task.update({
         where: { id: taskId },
         data: {
             assigneeId: assigneeId, // Prisma handles connect/disconnect based on null/value
         },
         include: { assignee: { select: { id: true, name: true } } },
     });

     // Emit WebSocket event
     this.eventsGateway.emitTaskUpdated(incidentId, updatedTask);

     // Notify if assignment changed
    //  if (assigneeId !== originalTask.assigneeId) {
    //      if (originalTask.assigneeId) { // Notify old assignee of unassignment
    //           this.notificationService.sendNotification(
    //               originalTask.assigneeId,
    //               `You have been unassigned from task "${updatedTask.description}" for incident ${incidentId}.`
    //           );
    //      }
    //      if (assigneeId) { // Notify new assignee
    //          this.notificationService.sendNotification(
    //              assigneeId,
    //              `You have been assigned task "${updatedTask.description}" for incident ${incidentId}.`
    //          );
    //      }
    //  }

    this.emitter2.emit('task.assigned', {task: updatedTask, incidentId, assigner: user, oldAssigneeId: originalTask.assigneeId}); // Emit event to all listeners

     return updatedTask;
  }


  async remove(taskId: string, user: User): Promise<Task> {
     // --- FIX: Use destructured task from helper ---
     const { incidentId } = await this.checkIncidentAndTaskPermission(taskId, user, 'task');

      // originalTask is guaranteed here
     const deletedTask = await this.prisma.task.delete({
         where: { id: taskId },
     });

     // Emit WebSocket event (Task Deleted)
     this.eventsGateway.emitTaskDeleted(incidentId, { taskId: deletedTask.id }); // Send minimal payload

     return deletedTask; // Return the deleted task data
  }
}