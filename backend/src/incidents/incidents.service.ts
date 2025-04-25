// import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { Prisma, Incident, User, Team, Role, IncidentStatus } from '@prisma/client'; // Import needed types
// import { CreateIncidentDto } from './dto/create-incident.dto';
// import { PrismaService } from 'prisma/prisma.service';

// @Injectable()
// export class IncidentsService {
//   constructor(private prisma: PrismaService) {}

//   async create(createIncidentDto: CreateIncidentDto, creator: User): Promise<Incident> {
//     try {
//       // Ensure user details are passed correctly
//       if (!creator || !creator.id) {
//           throw new ForbiddenException('Invalid user data for creating incident.');
//       }

//       // TODO: Add validation - check if the provided teamId actually exists
//       // const teamExists = await this.prisma.team.findUnique({ where: { id: createIncidentDto.teamId }});
//       // if (!teamExists) {
//       //   throw new NotFoundException(`Team with ID ${createIncidentDto.teamId} not found.`);
//       // }
//       // TODO: Add authorization - check if the creator is allowed to assign incidents to this teamId

//       // UPDATED: Use the UncheckedCreateInput approach by providing the foreign key directly
//       const incidentData: Prisma.IncidentUncheckedCreateInput = {
//           title: createIncidentDto.title,
//           description: createIncidentDto.description,
//           severity: createIncidentDto.severity,
//           teamId: createIncidentDto.teamId,
//           reporterId: creator.id, // Provide the foreign key directly
//           // ...createIncidentDto, // Spread DTO properties (title, description, severity)
//           // createdById: creator.id, // Link to the user who created it
//           // status will use defaults from schema if not in DTO
//       }

//       const incident = await this.prisma.incident.create({
//         data: incidentData,
//       })
//       return incident;
//     } catch (error) {
//         // Basic error logging
//         console.error("Error creating incident:", error);

//         // Handle potential Prisma unique constraint errors or other specific errors
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         // e.g., if title needed to be unique per team (not currently enforced)
//         if (error.code === 'P2002') {
//           throw new ForbiddenException('Incident creation failed due to constraint violation.');
//         }
//       }
//         throw new Error(`Could not create incident. ${error.message}`);
//     }
//   }

//   async findAll(user: User): Promise<Incident[]> {
//     // TODO: Implement pagination (e.g., using Prisma skip/take)
//     // TODO: Implement filtering (e.g., by status, severity, teamId based on user role/team)

//     // Default: Show all incidents for now, newest first
//     // Enhancement: Filter by user's team if user has a teamId and is not ADMIN
//     let whereClause: Prisma.IncidentWhereInput = {};
//     if(user.teamId && user.role !== Role.ADMIN){
//       whereClause = {
//         teamId: user.teamId,
//       };
//     }
//     return this.prisma.incident.findMany({
//       where: whereClause,
//       orderBy: {
//         createdAt: 'desc', // Show newest first
//       },
//       include: {
//         reported: { select: { id: true, name: true }},
//         team: { select: { id: true, name: true }}
//       }
//     });
//   }

//   async findOneById(id: string, user: User): Promise<Incident> {
//     const incident = await this.prisma.incident.findUnique({
//       where: { id },
//       // Include related data if needed by the frontend
//       include: {
//         reported: { select: { id: true, name: true, email: true } }, // Select specific user fields
//         team: { select: { id: true, name: true } },
//         messages: { // Example: include recent messages
//            orderBy: { createdAt: 'asc' },
//           //  take: 100, // Optional: Limit messages initially if needed
//            include: { sender: { select: { id: true, name: true } } },
//          },
//          tasks: { // ADDED: Include tasks for the incident detail view later
//             orderBy: { createdAt: 'asc' },
//             // include: { assignee: { select: { id: true, name: true }}} // Optional: Include assignee info
//          }
//       },
//     });

//     if (!incident) {
//       throw new NotFoundException(`Incident with ID "${id}" not found.`);
//     }

    
//     // Authorization Check: User must be ADMIN or belong to the incident's team
//     if (user.role !== Role.ADMIN && incident.teamId !== user.teamId) {
//       throw new ForbiddenException('You do not have permission to view this incident.');
//     }

//     return incident;
//   }

//   // --- Add update/delete methods later as needed ---
//   // async update(...) {}
//   // async remove(...) {}
// }


// src/incidents/incidents.service.ts
import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef, BadRequestException } from '@nestjs/common'; // Added BadRequestException
import { Prisma, Incident, User, Team, Role, IncidentStatus } from '@prisma/client';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway'; // <-- Import Gateway
// import { NotificationsService } from '../notifications/notifications.service'; // <-- Import Notifications
 import { TeamsService } from '../teams/teams.service'; // <-- Import TeamsService
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, // <-- Inject Gateway
    private emitter2: EventEmitter2,
    // private notificationService: NotificationsService, // <-- Inject Notifications
    private teamsService: TeamsService, // <-- Inject TeamsService
    // TasksService might be needed if deleting incident cascades tasks and needs cleanup/notifications
    // @Inject(forwardRef(() => TasksService))
    // private tasksService: TasksService,
  ) {}

   // --- Permission Helper (can be extracted to a shared utility/guard later) ---
   private async checkIncidentPermission(incidentId: string, user: User, bypassPermissionCheck = false): Promise<Incident> {
       const incident = await this.prisma.incident.findUnique({
           where: { id: incidentId },
           include: { team: true } // Include team for permission check
       });

       if (!incident) {
           throw new NotFoundException(`Incident with ID "${incidentId}" not found.`);
       }

       // Skip permission check if explicitly requested (e.g., internal service calls)
       if (bypassPermissionCheck) {
           return incident;
       }

       // Authorization Check: User must be ADMIN or belong to the incident's team
       if (user.role !== Role.ADMIN && incident.teamId !== user.teamId) {
           throw new ForbiddenException(`User not authorized for incident ${incident.id} (Team mismatch or insufficient role)`);
       }

       return incident;
   }

  // --- Create (Updated with Notifications) ---
  async create(createIncidentDto: CreateIncidentDto, creator: User): Promise<Incident> {
    // Ensure creator info is valid
    if (!creator || !creator.id) {
      throw new ForbiddenException('Invalid user data for creating incident.');
    }

    // Validate Team Exists
    try {
         await this.teamsService.findOne(createIncidentDto.teamId);
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw new NotFoundException(`Cannot assign incident: Team with ID "${createIncidentDto.teamId}" not found.`);
        }
        throw error; // Rethrow other errors
    }

    // Authorization: Check if user can assign to this team (e.g., are they ADMIN or on that team?)
    // Simple check for now: Allow ADMIN or if user is assigning to their OWN team (if they have one)
     if (creator.role !== Role.ADMIN && creator.teamId !== createIncidentDto.teamId) {
         // Allow if user has no team assigned yet? Or enforce they must be on the team? Let's be strict for now.
          if (!creator.teamId) {
               throw new ForbiddenException(`User without a team cannot assign incidents. Please join a team or contact an Admin.`);
          }
          throw new ForbiddenException(`User cannot assign incidents to Team ID "${createIncidentDto.teamId}". Must be ADMIN or on the target team.`);
     }


    const incidentData: Prisma.IncidentUncheckedCreateInput = {
      title: createIncidentDto.title,
      description: createIncidentDto.description,
      severity: createIncidentDto.severity, // Default should be handled by DTO or here if needed
      teamId: createIncidentDto.teamId,
      reporterId: creator.id,
      status: IncidentStatus.DETECTED, // Explicitly set initial status
    };

    try {
      const incident = await this.prisma.incident.create({
        data: incidentData,
        include: {
           reported: { select: { id: true, name: true }},
           team: { select: { id: true, name: true }}
        }
      });

      // Emit WebSocket event for new incident (e.g., to a general channel or team channel)
      this.eventsGateway.emitIncidentCreated(incident); // Assuming this method exists in gateway

      // Send notification to the assigned team
    //   this.notificationService.sendNotificationToTeam(
    //     incident.teamId,
    //     incident.title,
    //     `New Incident "${incident.title}" (Severity: ${incident.severity}) reported by ${creator.name} requires attention.`
    //   );

    this.emitter2.emit('incident.created', {incident, creator}); // Emit event to all listeners

      return incident;
    } catch (error) {
      console.error("Error creating incident:", error);
      // Handle specific Prisma errors if necessary
      throw new Error(`Could not create incident. ${error.message}`);
    }
  }

  // --- FindAll (Remains largely the same, RBAC filtering is good) ---
  async findAll(user: User): Promise<Incident[]> {
     let whereClause: Prisma.IncidentWhereInput = {};
     if (user.role !== Role.ADMIN) {
         // Non-admins only see incidents for their team(s)
         if (!user.teamId) {
             // If user has no team, they see no incidents (unless ADMIN)
             return [];
         }
         whereClause = {
             teamId: user.teamId,
         };
     }
     // Admins see all incidents (whereClause remains empty)

     return this.prisma.incident.findMany({
     where: whereClause,
     orderBy: {
         createdAt: 'desc',
     },
     include: {
         reported: { select: { id: true, name: true } },
         team: { select: { id: true, name: true } }
     }
     });
  }
  
   // --- FindOneById (Updated to use permission helper) ---
  async findOneById(id: string, user: User, bypassPermissionCheck = false): Promise<Incident> {
     // Perform permission check unless bypassed
     await this.checkIncidentPermission(id, user, bypassPermissionCheck);

     // Fetch full details after permission check passes
     const incident = await this.prisma.incident.findUnique({
         where: { id },
         include: {
             reported: { select: { id: true, name: true, email: true } },
             team: { select: { id: true, name: true } },
             messages: {
                 orderBy: { createdAt: 'asc' },
                 take: 100, // Limit initial message load
                 include: { sender: { select: { id: true, name: true } } },
             },
             tasks: {
                 orderBy: { createdAt: 'asc' },
                 include: { assignee: { select: { id: true, name: true } } },
             },
         },
     });

     // Should not happen if checkIncidentPermission passed, but defensive check
     if (!incident) {
         throw new NotFoundException(`Incident with ID "${id}" not found (post-permission check).`);
     }

     return incident;
  }

  // --- NEW: Update Status ---
  async updateStatus(incidentId: string, newStatus: IncidentStatus, user: User): Promise<Incident> {
     const incident = await this.checkIncidentPermission(incidentId, user); // Check permission first

     // Optional: Add status transition validation logic
     // Example: Cannot go directly from DETECTED to RESOLVED
     const allowedTransitions: Partial<Record<IncidentStatus, IncidentStatus[]>> = {
         [IncidentStatus.DETECTED]: [IncidentStatus.INVESTIGATING],
         [IncidentStatus.INVESTIGATING]: [IncidentStatus.MITIGATING, IncidentStatus.RESOLVED, IncidentStatus.POSTMORTEM], // Allow direct to postmortem?
         [IncidentStatus.MITIGATING]: [IncidentStatus.RESOLVED, IncidentStatus.INVESTIGATING], // Can go back if mitigation fails
         [IncidentStatus.RESOLVED]: [IncidentStatus.POSTMORTEM, IncidentStatus.INVESTIGATING], // Re-open
         [IncidentStatus.POSTMORTEM]: [], // Nothing follows postmortem in this simple model
     };

     // --- FIX: Check if the current status exists as a key AND if the transition is allowed ---
     const currentAllowed = allowedTransitions[incident.status];
     if (currentAllowed === undefined || !currentAllowed.includes(newStatus)) {
          throw new BadRequestException(`Invalid status transition from ${incident.status} to ${newStatus}.`);
     }
     // --- END FIX ---

    //  if (allowedTransitions[incident.status] && !allowedTransitions[incident.status].includes(newStatus)) {
    //       throw new BadRequestException(`Invalid status transition from ${incident.status} to ${newStatus}.`);
    //  }


     const updatedIncident = await this.prisma.incident.update({
         where: { id: incidentId },
         data: { status: newStatus },
          include: { // Include necessary fields for event payload
              reported: { select: { id: true, name: true } },
              team: { select: { id: true, name: true } }
          }
     });

      // Emit WebSocket event
      // Ensure user object passed to emit is SafeUser (omit passwordHash)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      this.eventsGateway.emitIncidentStatusUpdated(incidentId, updatedIncident.status, safeUser);

     // Send notification
    //  this.notificationService.sendNotificationToTeam(
    //      updatedIncident.teamId,
    //      updatedIncident.title,
    //      `Incident "${updatedIncident.title}" status changed from ${incident.status} to ${updatedIncident.status} by ${user.name}.`
    //  );

    this.emitter2.emit('incident.status.updated', {incidentId, oldStatus: incident.status, newStatus: updatedIncident.status, updatedByUser: user, incidentTitle: updatedIncident.title, teamId: updatedIncident.teamId}); // Emit event to all listeners

     return updatedIncident;
  }

  // Optional: Add delete incident logic if needed
  // async remove(incidentId: string, user: User): Promise<Incident> {
  //    // Only ADMINs can delete?
  //    if (user.role !== Role.ADMIN) {
  //        throw new ForbiddenException('Only ADMINs can delete incidents.');
  //    }
  //    await this.checkIncidentPermission(incidentId, user); // Still check existence
  //
  //    // Handle related data deletion/cleanup if needed (e.g., notify about task deletion if cascade)
  //
  //    const deletedIncident = await this.prisma.incident.delete({ where: { id: incidentId } });
  //
  //    this.eventsGateway.emitIncidentDeleted(incidentId); // Notify clients
  //    // Send notifications?
  //
  //    return deletedIncident;
  // }

}