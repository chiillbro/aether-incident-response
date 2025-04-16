import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Prisma, Team, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ManageTeamUserDto } from './dto/manage-team-user.dto';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService, // <-- Inject UsersService
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    try {
      const team = await this.prisma.team.create({
        data: {
          name: createTeamDto.name,
        },
      });
      return team;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g., team name already exists)
        if (error.code === 'P2002') {
          throw new ConflictException(`Team with name "${createTeamDto.name}" already exists.`);
        }
      }
      console.error("Error creating team:", error); // Log the actual error
      throw new InternalServerErrorException('Could not create team.');
    }
  }

  async findAll(): Promise<Team[]> {
    return this.prisma.team.findMany({
      orderBy: {
        name: 'asc', // Optional: order teams alphabetically
      }
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException(`Team with ID "${id}" not found.`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    try {
      const updatedTeam = await this.prisma.team.update({
        where: { id },
        data: updateTeamDto,
      });
      return updatedTeam;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record to update not found
          throw new NotFoundException(`Team with ID "${id}" not found.`);
        }
        if (error.code === 'P2002') { // Unique constraint violation
          throw new ConflictException(`Team name "${updateTeamDto.name}" is already in use.`);
        }
      }
      console.error(`Error updating team ${id}:`, error);
      throw new InternalServerErrorException('Could not update team.');
    }
  }

  async remove(id: string): Promise<Team> {
     // First check if the team exists
     await this.findOne(id); // Throws NotFoundException if not found

     try {
         // Attempt to delete
         const deletedTeam = await this.prisma.team.delete({
             where: { id },
         });
         return deletedTeam;
     } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
             // Handle foreign key constraint violation (e.g., team has users or incidents)
             // P2014: The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models.
             // P2003: Foreign key constraint failed on the field: `...` (specific field isn't always clear)
             if (error.code === 'P2003' || error.code === 'P2014') {
                 // Note: Your schema uses onDelete: Restrict for incidents, which prevents deletion via P2003.
                 // Users use onDelete: SetNull, so they wouldn't block deletion directly, but good to be general.
                 throw new ConflictException(`Cannot delete team "${id}" as it is associated with existing users or incidents.`);
             }
         }
         console.error(`Error deleting team ${id}:`, error);
         throw new InternalServerErrorException('Could not delete team.');
     }
  }

  // --- NEW: Add User to Team ---
  async addUserToTeam(teamId: string, manageTeamUserDto: ManageTeamUserDto): Promise<User> {
    const { userId } = manageTeamUserDto;

    // 1. Check if team exists
    await this.findOne(teamId); // findOne throws NotFoundException if team doesn't exist

    // 2. Check if user exists and get their current teamId
    let user: User;
    try {
       user = await this.usersService.findOneById(userId);
    } catch (error) {
       throw new NotFoundException(`User with ID "${userId}" not found.`);
    }


    // 3. Check if user is already in this team
    if (user.teamId === teamId) {
        throw new ConflictException(`User "${user.name}" is already a member of this team.`);
    }

    // 4. Check if user is already in another team (optional - decide policy)
    // If you want to prevent users being in multiple teams (via this method):
    if (user.teamId) {
         throw new BadRequestException(`User "${user.name}" is already assigned to another team (ID: ${user.teamId}). Remove them first.`);
    }

    // 5. Update the user's teamId
    try {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { teamId: teamId }, // Assign the team
        });
        return updatedUser;
    } catch (error) {
        console.error(`Error adding user ${userId} to team ${teamId}:`, error);
        throw new InternalServerErrorException('Could not add user to team.');
    }
}

// --- NEW: Remove User from Team ---
async removeUserFromTeam(teamId: string, manageTeamUserDto: ManageTeamUserDto): Promise<User> {
   const { userId } = manageTeamUserDto;
    // 1. Check if team exists
    await this.findOne(teamId);

    // 2. Check if user exists
    let user: User;
     try {
        user = await this.usersService.findOneById(userId);
     } catch (error) {
        throw new NotFoundException(`User with ID "${userId}" not found.`);
     }

    // 3. Check if the user is actually a member of *this specific* team
    if (user.teamId !== teamId) {
        throw new BadRequestException(`User "${user.name}" is not a member of this team (ID: ${teamId}).`);
    }

    // 4. Update the user's teamId to null
    try {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { teamId: null }, // Unassign the team
        });
        return updatedUser;
    } catch (error) {
        console.error(`Error removing user ${userId} from team ${teamId}:`, error);
        throw new InternalServerErrorException('Could not remove user from team.');
    }
}

// --- NEW: Get Team Members ---
async findTeamMembers(teamId: string): Promise<Omit<User, 'passwordHash'>[]> {
   await this.findOne(teamId); // Ensure team exists

   return this.prisma.user.findMany({
       where: { teamId: teamId },
       select: { // Select only non-sensitive fields
           id: true,
           email: true,
           name: true,
           role: true,
           teamId: true,
           createdAt: true,
           updatedAt: true,
            // DO NOT INCLUDE passwordHash
            // Include other relations if needed? Probably not here.
       }
   })
}
}