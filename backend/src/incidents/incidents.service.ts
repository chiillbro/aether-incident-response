import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, Incident, User } from '@prisma/client'; // Import needed types
import { CreateIncidentDto } from './dto/create-incident.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentDto, creator: User): Promise<Incident> {
    try {
      // Ensure user details are passed correctly
      if (!creator || !creator.id) {
          throw new ForbiddenException('Invalid user data for creating incident.');
      }

      const incident = await this.prisma.incident.create({
        data: {
          ...createIncidentDto, // Spread DTO properties (title, description, severity)
          createdById: creator.id, // Link to the user who created it
          // status and severity will use defaults from schema if not in DTO
          // teamId: creator.teamId, // Optional: Assign to creator's team automatically? Needs logic.
        },
      });
      return incident;
    } catch (error) {
        // Basic error logging
        console.error("Error creating incident:", error);
        // Handle potential Prisma errors more specifically if needed
        throw new Error(`Could not create incident. ${error.message}`);
    }
  }

  async findAll(user: User): Promise<Incident[]> {
    // Basic implementation: Return all incidents for now.
    // TODO: Implement pagination (e.g., using Prisma skip/take)
    // TODO: Implement filtering (e.g., by status, severity, teamId based on user role/team)
    return this.prisma.incident.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
      // Example: Only show incidents for user's team (requires teamId on user)
      // where: {
      //   teamId: user.teamId,
      // },
    });
  }

  async findOneById(id: string, user: User): Promise<Incident> {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      // Include related data if needed by the frontend
      // include: {
      //   createdBy: { select: { id: true, name: true } }, // Select specific user fields
      //   messages: { // Example: include recent messages
      //      orderBy: { createdAt: 'asc' },
      //      take: 50,
      //      include: { sender: { select: { id: true, name: true } } },
      //    },
      // },
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID "${id}" not found.`);
    }

    // TODO: Add authorization check - does this user have permission to view this incident?
    // (e.g., is the user part of the incident's team?)
    // if (incident.teamId && incident.teamId !== user.teamId && user.role !== Role.ADMIN) {
    //   throw new ForbiddenException('You do not have permission to view this incident.');
    // }

    return incident;
  }

  // --- Add update/delete methods later as needed ---
  // async update(...) {}
  // async remove(...) {}
}