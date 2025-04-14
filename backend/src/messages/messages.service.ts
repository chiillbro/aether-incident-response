import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Message } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
     const { content, incidentId, senderId } = createMessageDto;

     // Optional: Validate if incidentId and senderId exist before creating
     // const incidentExists = await this.prisma.incident.findUnique({ where: { id: incidentId } });
     // if (!incidentExists) {
     //    throw new NotFoundException(`Incident with ID ${incidentId} not found`);
     // }
     // const senderExists = await this.prisma.user.findUnique({ where: { id: senderId } });
     // if (!senderExists) {
     //    throw new NotFoundException(`Sender with ID ${senderId} not found`);
     // }

     try {
         const message = await this.prisma.message.create({
           data: {
             content,
             incidentId,
             senderId,
           },
           // Include sender info immediately for broadcasting
           include: {
              sender: {
                  select: { id: true, name: true, email: true } // Select needed fields
              }
           }
         });
         return message;
     } catch (error) {
        console.error("Error creating message:", error);
        throw new Error(`Could not save message. ${error.message}`);
     }
  }

  async findMessagesByIncident(incidentId: string, limit = 50): Promise<Message[]> {
     return this.prisma.message.findMany({
        where: { incidentId },
        orderBy: { createdAt: 'asc' }, // Oldest first for chat history
        take: limit, // Limit number of messages fetched initially
        include: {
           sender: {
              select: { id: true, name: true, email: true } // Include sender details
           }
        }
     });
  }
}