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

// --- Interface for findAll Query Parameters ---
export interface FindAllTasksParams {
    assigneeId?: string;
    status?: TaskStatus[]; // Array of statuses
    incidentId?: string; // Optional: filter by incident
    limit?: number;
    page?: number;
    sortBy?: string; // e.g., 'createdAt:asc' or 'updatedAt:desc'
    // Add other filters like teamId if needed later
  }


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
         include: { 
            assignee: { select: { id: true, name: true } },
            incident: {select: { title: true}}
         }, // Include assignee for event payload
     });

     // Emit WebSocket event
     this.eventsGateway.emitTaskCreated(incidentId, {...newTask, owner: creator.id});

     // Send notification if assigned
     if (newTask.assigneeId) {
        //  this.notificationService.sendNotification(
        //      newTask.assigneeId,
        //      `You have been assigned a new task for incident ${incidentId}: "${newTask.description}"`
        //  );

        console.log("event emitted", )
        this.emitter2.emit('task.created', {task: newTask, incidentId, creator}); // Emit event to all listeners
     }

     return newTask;
  }

//   async findByIncident(incidentId: string, user: User): Promise<Task[]> {
//      // Permission check is implicitly handled by checking incident access first
//      await this.checkIncidentAndTaskPermission(incidentId, user, 'incident');

//      return this.prisma.task.findMany({
//          where: { incidentId },
//          orderBy: { createdAt: 'asc' },
//          include: {
//              assignee: { select: { id: true, name: true } }, // Include assignee details
//          },
//      });
//   }


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
         include: { 
            assignee: { select: { id: true, name: true } },
            incident: {select: { title: true}}
         },
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
         include: { 
            assignee: { select: { id: true, name: true } },
            incident: {select: { title: true}}
         },
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

  // --- DEPRECATE/RENAME findByIncident in favor of findAll ---
  // Keep it for now if Incident detail page uses it, but plan to merge logic
  async findByIncident(incidentId: string, user: User): Promise<Task[]> {
    await this.checkIncidentAndTaskPermission(incidentId, user, 'incident');
    // Delegate to the new findAll method
    return this.findAll({ incidentId: incidentId }, user);
  }

  // --- NEW: Versatile findAll method ---
  async findAll(params: FindAllTasksParams, user: User): Promise<Task[]> {
    const { assigneeId, status, incidentId, limit = 50, page = 1, sortBy } = params;
    const whereClause: Prisma.TaskWhereInput = {};

    // --- RBAC and Filtering Logic ---
    if (user.role !== Role.ADMIN) {
      // Non-admin users can only see tasks assigned to them OR tasks within incidents of their team
      // For the specific "My Tasks" use case triggered by providing assigneeId=user.id,
      // we force the assigneeId filter.
      if (assigneeId && assigneeId === user.id) {
          whereClause.assigneeId = user.id; // Force filter by own ID
      } else if (incidentId) {
          // If filtering by incident, ensure user has access via team
          // (checkIncidentAndTaskPermission handles this for single incident lookups)
          // We need to check team access here if filtering tasks by incident for non-admins
          const incidentCheck = await this.checkIncidentAndTaskPermission(incidentId, user, 'incident');
          whereClause.incidentId = incidentId; // Filter by incident
          whereClause.incident = { teamId: incidentCheck.incidentTeamId }; // Ensure team match
      } else {
          // If not ADMIN and not asking for own tasks or specific incident, return empty?
          // Or return tasks for their team's incidents? Let's return only assigned for now.
          // Force assigneeId filter if not admin and no specific incident filter is applied
           if (!assigneeId) {
             // This prevents non-admins from getting all tasks by omitting assigneeId
             whereClause.assigneeId = user.id;
           } else {
               // If assigneeId is provided but doesn't match user.id, non-admin cannot view
               throw new ForbiddenException("You can only view tasks assigned to you.");
           }
      }
    } else {
       // ADMIN can filter by any assignee if provided
       if (assigneeId) {
           whereClause.assigneeId = assigneeId;
       }
       if (incidentId) {
           whereClause.incidentId = incidentId; // Admin can filter by any incident
       }
       // Admins can see tasks across all incidents/teams if no filter applied
    }

    // Add status filter if provided
    if (status && status.length > 0) {
        // Ensure valid statuses (optional, class-validator can do this earlier)
        const validStatuses = status.filter(s => Object.values(TaskStatus).includes(s));
        if (validStatuses.length > 0) {
             whereClause.status = { in: validStatuses };
        }
    }
    // --- End RBAC and Filtering ---

    // --- Sorting ---
    let orderByClause: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' }; // Default sort
    if (sortBy) {
        const [field, direction] = sortBy.split(':');
        if (field && (direction === 'asc' || direction === 'desc')) {
            // Basic sorting, add more allowed fields as needed
            if (field === 'createdAt' || field === 'updatedAt' || field === 'status') {
                 orderByClause = { [field]: direction };
            }
             // Add sorting by incident title or assignee name if needed (requires nested orderBy)
             // else if (field === 'assigneeName') { orderByClause = { assignee: { name: direction } }; }
        }
    }
    // --- End Sorting ---

    // --- Pagination ---
    const skip = (page > 0 ? page - 1 : 0) * limit;
    const take = limit > 0 && limit <= 100 ? limit : 50; // Set a max limit
    // --- End Pagination ---


    return this.prisma.task.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: take,
        skip: skip,
        include: {
            assignee: { select: { id: true, name: true } }, // Include assignee details
            incident: { select: { id: true, title: true } } // Include incident details for context
        },
    });
  }
}