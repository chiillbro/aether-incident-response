import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException, // Use WsException for WebSocket errors
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service'; // Import MessagesService
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common'; // Import Logger etc.
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt'; // For validating token
import { UsersService } from '../users/users.service'; // To fetch user details
import { Incident, User as PrismaUser, Role, Task, IncidentStatus } from '@prisma/client';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

type SafeUser = Omit<PrismaUser, 'passwordHash'>; // Exclude passwordHash
// Extend Socket type to include our custom user data
interface AuthenticatedSocket extends Socket {
   user?: SafeUser; // Attach authenticated user here
}

// Define payload structures for clarity
interface JoinLeavePayload {
    incidentId: string;
}

interface SendMessagePayload {
    incidentId: string;
    content: string;
}

interface TypingInfo {
   timeoutId: NodeJS.Timeout;
    incidentId: string;

}

// interface TypingPayload { incidentId: string; isTyping: boolean; } // Refined Typing payload

@WebSocketGateway({
   cors: { // Configure CORS for WebSocket connections
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Use env var
      methods: ['GET', 'POST'],
      credentials: true,
   },
   // path: '/events', // Optional: Namespace path
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer()
   server: Server; // Inject the Socket.IO server instance

   private readonly logger = new Logger(EventsGateway.name);

   constructor(
      private readonly messagesService: MessagesService,
      private readonly jwtService: JwtService, // Inject for token validation
      private readonly usersService: UsersService, // Inject to get user details
      private readonly configService: ConfigService, // Needed for JWT secret
   ) {}

   afterInit(server: Server) {
      this.logger.log('WebSocket Gateway Initialized');
      // Attach authentication middleware here if preferred over handleConnection
      // server.use(async (socket: AuthenticatedSocket, next) => { ... });
   }

   // --- Handle Connection & Authentication ---
   async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      this.logger.log(`Client connected: ${client.id}, trying token auth...`);

      if (!token) {
         this.logger.warn(`Client ${client.id}: No token provided. Disconnecting.`);
         client.emit('error', 'Authentication token missing.'); // Send error message
         client.disconnect(true); // Force disconnect
         return;
      }

      try {
         const secret = this.configService.get<string>('JWT_SECRET');
         if (!secret) throw new Error('JWT_SECRET not configured.');

         const payload = await this.jwtService.verifyAsync(token, { secret });
         // console.log("WS Auth Payload:", payload); // Careful logging payload

         const user = await this.usersService.findOneById(payload.sub); // 'sub' should be user ID
         if (!user) {
            throw new UnauthorizedException('User not found from token.');
         }
         // Attach user to socket object for later use
         const { passwordHash, ...safeUser } = user; // Exclude sensitive info
         client.user = safeUser;
         this.logger.log(`Client ${client.id} authenticated as ${safeUser.email}`);

         client.emit("authenticated", { user: safeUser });
      } catch (error) {
         this.logger.error(`Client ${client.id} Authentication failed: ${error.message}`);
         client.emit('error', `Authentication failed: ${error.message}`);
         client.disconnect(true);
      }
   }

   handleDisconnect(client: AuthenticatedSocket) {
      // Clear typing status on disconnect
      this.clearTypingStatus(client);
      this.logger.log(`Client disconnected: ${client.id} (${client.user?.email || 'Unauthenticated'})`);
      // TODO: Handle cleanup if needed (e.g., leave all rooms)
   }

   // --- Handle Incident Room Joining ---
   @SubscribeMessage('joinIncidentRoom')
   async handleJoinRoom(
      @MessageBody() payload: JoinLeavePayload, // Use interface for payload
      @ConnectedSocket() client: AuthenticatedSocket, // Use typed socket
   ): Promise<void> {

      this.logger.log(`from handleJoinRoom: Client ${client.user} payload: ${JSON.stringify(payload)}, incidentId: ${payload.incidentId}`);
      if (!client.user) throw new WsException('Client not authenticated.');
      if (!payload || !payload.incidentId) throw new WsException('Missing incidentId in payload.');

      const roomName = `incident-${payload.incidentId}`;

      try {
        await client.join(roomName);

        this.logger.log(`Client ${client.user.email} (${client.id}) successfully joined room: ${roomName}`);
        client.emit('joinedRoom', { incidentId: payload.incidentId, room: roomName });

        // --- Fetch and Emit History ---
        this.logger.debug(`Fetching message history for incident ${payload.incidentId} for client ${client.id}`);

        const messageHistory = await this.messagesService.findMessagesByIncident(payload.incidentId);
        this.logger.debug(`Emitting messageHistory with ${messageHistory.length} messages to client ${client.id}`);
        client.emit('messageHistory', { incidentId: payload.incidentId, messages: messageHistory });
        
      } catch (error) {
        this.logger.error(`Error during handleJoinRoom for client ${client.id}, room ${roomName}: ${error.message}`, error.stack);
          // Optionally emit a specific error back to the client
        client.emit('joinRoomError', { incidentId: payload.incidentId, error: `Failed to join room: ${error.message}` });
      }
      // client.join(roomName);

      // this.logger.log(`from handleJoinRoom: Client ${client.user.email} (${client.id}) joined room: ${roomName}`);

      // Optional: Emit confirmation back to client
      // client.emit('joinedRoom', { incidentId: payload.incidentId, room: roomName });

      // Optional: Fetch and emit recent messages for the joining user
      // this.messagesService.findMessagesByIncident(payload.incidentId).then(messages => {
      //    client.emit('incidentMessageHistory', { incidentId: payload.incidentId, messages });
      // });
   }

   // --- Handle Incident Room Leaving ---
   @SubscribeMessage('leaveIncidentRoom')
   handleLeaveRoom(
      @MessageBody() payload: JoinLeavePayload,
      @ConnectedSocket() client: AuthenticatedSocket,
   ): void {
      if (!client.user) throw new WsException('Client not authenticated.');
      if (!payload || !payload.incidentId) throw new WsException('Missing incidentId in payload.');


      const roomName = `incident-${payload.incidentId}`;

      // Clear typing status on leave room
      this.clearTypingStatus(client, payload.incidentId);
      this.logger.log(`Client ${client.user.email} leaving room: ${roomName}`);
      client.leave(roomName);

      // Optional: Emit confirmation
      client.emit('leftRoom', { incidentId: payload.incidentId, room: roomName });
   }

   // --- Handle Incoming Messages ---
   @SubscribeMessage('sendIncidentMessage')
   async handleMessage(
      @MessageBody() payload: SendMessagePayload,
      @ConnectedSocket() client: AuthenticatedSocket,
   ): Promise<void> { // Can be async if awaiting DB save
      if (!client.user) throw new WsException('Client not authenticated.');
      if (!payload || !payload.incidentId || !payload.content) {
         throw new WsException('Invalid message payload.');
      }
      if (payload.content.trim().length === 0) {
        throw new WsException('Message content cannot be empty.');
      }

      // Stop typing indicator when message is sent
      this.clearTypingStatus(client, payload.incidentId);

      this.logger.log(`Message from ${client.user.email} for incident ${payload.incidentId}: ${payload.content}`);

      try {
         // 1. Save message to database
         const createMessageDto: CreateMessageDto = {
            content: payload.content,
            incidentId: payload.incidentId,
            senderId: client.user.id, // Get sender ID from authenticated socket
         };
         const savedMessage = await this.messagesService.create(createMessageDto);
         // savedMessage now includes sender info due to Prisma include

         // 2. Broadcast message to the specific incident room
         const roomName = `incident-${payload.incidentId}`;

         this.logger.debug(`Broadcasting to room '${roomName}'. Sender (${client.id}) is currently in rooms: ${JSON.stringify(Array.from(client.rooms))}`);

         this.server.to(roomName).emit('newIncidentMessage', savedMessage); // Send the full message object

        // Use consistent room naming
        // const roomName = `incident-${payload.incidentId}`;
        // // Add validation for room existence
        // if (this.server.sockets.adapter.rooms.has(roomName)) {
        //   this.server.to(roomName).emit('newIncidentMessage', savedMessage);
        // } else {
        //   this.logger.warn(`Attempted to broadcast to non-existent room: ${roomName}`);
        // }

         // Optional: Send confirmation back to sender? Usually not needed.
         // client.emit('messageSentConfirmation', { tempId: payload.tempId, message: savedMessage });

      } catch (error) {
         this.logger.error(`Failed to save or broadcast message: ${error.message}`);
         // Send error back to the specific client who sent the message
         client.emit('sendMessageError', { error: `Failed to send message: ${error.message}`, originalPayload: payload });
         // Or throw WsException
         // throw new WsException(`Failed to send message: ${error.message}`);
      }
   }

   // Add to EventsGateway
private typingUsers = new Map<string, TypingInfo>();

// @SubscribeMessage('typing')
// handleTyping(
//    @MessageBody() payload: { incidentId: string },
//   @ConnectedSocket() client: AuthenticatedSocket,
// ) {
//   if (!client.user) return;
  
//   const roomName = `incident-${payload.incidentId}`;
//   // Notify others in the room
//   client.to(roomName).emit('userTyping', client.user.id);
  
//   // Refresh timeout
//   if (this.typingUsers.has(client.user.id)) {
//     clearTimeout(this.typingUsers.get(client.user.id));
//   }
//   this.typingUsers.set(client.user.id, 
//     setTimeout(() => this.handleStopTyping(client, payload.incidentId), 2000)
//   );
// }


@SubscribeMessage('typing')
handleTyping(
   @MessageBody() payload: { incidentId: string },
   @ConnectedSocket() client: AuthenticatedSocket,
): void {
   if (!client.user) return; // Ignore if not authenticated

   const roomName = `incident-${payload.incidentId}`;
   const userId = client.user.id;
   const currentTypingInfo = this.typingUsers.get(userId);

   // Clear existing timeout if user types again quickly
   if (currentTypingInfo) {
       clearTimeout(currentTypingInfo.timeoutId);
   } else {
       // Only emit userTyping if they weren't previously marked as typing
      // (This simple logic assumes typing in one incident stops typing in another)
         // A more complex implementation could track typing per incident per user.
      client.to(roomName).emit('userTyping', { userId: userId, userName: client.user.name });
      this.logger.debug(`${client.user.name} started typing in ${roomName}`);
   }

   // Set a new timeout
   const timeoutId = setTimeout(() => {
       this.handleStopTypingOnTimeout(userId, payload.incidentId); // Call stop typing logic
   }, 3000); // User stops typing after 3 seconds of inactivity

   this.typingUsers.set(userId, { timeoutId, incidentId: payload.incidentId });
}

// This can be called internally by the timeout or potentially by a 'stopTyping' message
private handleStopTypingOnTimeout(userId: string, incidentId: string): void {
   const user = this.typingUsers.get(userId);

   if (user && user.incidentId === incidentId) {
      const roomName = `incident-${incidentId}`;
      // Use the user details from the socket if available (might not be if disconnected)
      // It's safer to just emit the ID here. The frontend can map ID to name.
      this.server.to(roomName).emit('userStoppedTyping', { userId: userId }); // Emit only ID
      this.typingUsers.delete(userId); // Remove the user from typing map
      this.logger.debug(`User ID ${userId} stopped typing in ${roomName} (timeout).`);
  }
   // If user.incidentId doesn't match, it means they started typing in another incident
   // more recently, so this specific timeout should just be ignored.
}


// Helper to clear typing status (e.g., on disconnect, leave room, send message)
private clearTypingStatus(client: AuthenticatedSocket, specificIncidentId?: string): void {
    if (!client.user) return;
    const userId = client.user.id;
    const currentTypingInfo = this.typingUsers.get(userId);

    if (currentTypingInfo) {
        // If specificIncidentId is provided, only clear if it matches the one we stored
        if (!specificIncidentId || currentTypingInfo.incidentId === specificIncidentId) {
            clearTimeout(currentTypingInfo.timeoutId);
            const roomName = `incident-${currentTypingInfo.incidentId}`;
            // Notify others in that specific room
            client.to(roomName).emit('userStoppedTyping', { userId: userId }); // Use client.to to avoid sending to self if clearing manually
            this.typingUsers.delete(userId);
            this.logger.debug(`${client.user.name} cleared typing status for incident ${currentTypingInfo.incidentId}.`);
        }
    }
}


// @SubscribeMessage('stopTyping')
// handleStopTyping(
//   @ConnectedSocket() client: AuthenticatedSocket,
//   @MessageBody() incidentId: string
// ) {
//   if (!client.user) return;
  
//   const roomName = `incident-${incidentId}`;
//   client.to(roomName).emit('userStoppedTyping', client.user.id);
//   if (this.typingUsers.has(client.user.id)) {
//     clearTimeout(this.typingUsers.get(client.user.id));
//     this.typingUsers.delete(client.user.id);
//   }
// }

 // --- Public Methods for Services to Call ---

  // Called by IncidentsService when an incident is created
  emitIncidentCreated(incident: Incident): void {
   this.logger.log(`Emitting 'incidentCreated' for Incident ID: ${incident.id} to Team Room: team-${incident.teamId}`);
   // Emit to a general 'dashboard' room? Or specific team room?
   // Let's emit to a room for the assigned team.
   const teamRoom = `team-${incident.teamId}`;
   this.server.to(teamRoom).emit('incidentCreated', incident);
   // Maybe also emit to all ADMINs?
}

// Called by IncidentsService when status updates
emitIncidentStatusUpdated(incidentId: string, status: IncidentStatus, updatedByUser: SafeUser): void {
   const roomName = `incident-${incidentId}`;
   this.logger.log(`Emitting 'incidentStatusUpdated' to room ${roomName}`);
   this.server.to(roomName).emit('incidentStatusUpdated', { incidentId, status, updatedBy: { id: updatedByUser.id, name: updatedByUser.name } });
}

// Called by TasksService when a task is created
emitTaskCreated(incidentId: string, task: Task & { owner: string }): void {
   const roomName = `incident-${incidentId}`;
   this.logger.log(`Emitting 'taskCreated' to room ${roomName}`);
   this.server.to(roomName).emit('taskCreated', task); // Send the full task object
}

// Called by TasksService when a task is updated (status, description, assignee)
emitTaskUpdated(incidentId: string, task: Task): void {
   const roomName = `incident-${incidentId}`;
   this.logger.log(`Emitting 'taskUpdated' to room ${roomName}`);
   this.server.to(roomName).emit('taskUpdated', task); // Send the full updated task object
}

// Called by TasksService when a task is deleted
emitTaskDeleted(incidentId: string, payload: { taskId: string }): void {
   const roomName = `incident-${incidentId}`;
   this.logger.log(`Emitting 'taskDeleted' to room ${roomName}`);
   this.server.to(roomName).emit('taskDeleted', payload);
}

// Called by IncidentsService if implementing incident deletion
emitIncidentDeleted(incidentId: string): void {
   const roomName = `incident-${incidentId}`;
   this.logger.log(`Emitting 'incidentDeleted' globally and to room ${roomName}`);
   // Emit to specific room first to maybe trigger UI cleanup
   this.server.to(roomName).emit('incidentDeleted', { incidentId });
   // Emit globally? Or to team rooms? Needs careful thought on UI impact.
   // this.server.emit('incidentDeletedGlobal', { incidentId });

   // Force clients out of the deleted incident's room
   this.server.in(roomName).disconnectSockets(true);
}

// Handle joining team-specific rooms for global notifications
@SubscribeMessage('joinTeamRoom')
handleJoinTeamRoom(
  @MessageBody() payload: { teamId: string },
  @ConnectedSocket() client: AuthenticatedSocket,
): void {
  if (!client.user || !payload.teamId) throw new WsException('Authentication or teamId missing.');

  // Authorization: Ensure user actually belongs to this team or is ADMIN
  if (client.user.role !== Role.ADMIN && client.user.teamId !== payload.teamId) {
      throw new WsException(`User not authorized to join team room ${payload.teamId}`);
  }

  const roomName = `team-${payload.teamId}`;
  client.join(roomName);
  this.logger.log(`Client ${client.user.email} joined team room: ${roomName}`);
  client.emit('joinedTeamRoom', { teamId: payload.teamId });
}

@SubscribeMessage('leaveTeamRoom')
handleLeaveTeamRoom(
  @MessageBody() payload: { teamId: string },
  @ConnectedSocket() client: AuthenticatedSocket,
): void {
   if (!client.user || !payload.teamId) throw new WsException('Authentication or teamId missing.');
   // No auth check needed for leaving

   const roomName = `team-${payload.teamId}`;
   client.leave(roomName);
   this.logger.log(`Client ${client.user.email} left team room: ${roomName}`);
   client.emit('leftTeamRoom', { teamId: payload.teamId });
}

}


