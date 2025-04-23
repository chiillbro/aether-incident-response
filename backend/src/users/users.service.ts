import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
// import { Prisma, User } from 'generated/prisma';
import { User, Prisma } from '@prisma/client'; // Correct import from node_modules
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // --- NEW: Update by Admin ---
  async updateUserAdmin(id: string, data: UpdateUserAdminDto): Promise<Omit<User, 'passwordHash'>> {
    // Ensure user exists
    await this.findOneById(id);

    // Prevent admin from changing their own role/team via this method? Optional check.
    // if (userPerformingAction.id === id && data.role && data.role !== userPerformingAction.role) {
    //    throw new BadRequestException("Admins cannot change their own role.");
    // }

    // Validate team exists if teamId is provided (and not null)
    if (data.teamId) {
       const teamExists = await this.prisma.team.findUnique({ where: { id: data.teamId }});
       if (!teamExists) {
           throw new NotFoundException(`Team with ID "${data.teamId}" not found.`);
       }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
            role: data.role,
            // Handle setting teamId to null explicitly or connecting to new team
            teamId: data.teamId === null ? null : data.teamId,
        },
         select: { // Return non-sensitive data
            id: true, email: true, name: true, role: true, teamId: true,
            createdAt: true, updatedAt: true,
         }
      });
      return updatedUser;
    } catch (error) {
        // Handle potential errors (e.g., unique constraints if changing email, though not allowed here)
        console.error(`Error updating user ${id} by admin:`, error);
        throw new Error('Could not update user.');
    }
  }
  // --------------------------

  // --- NEW: Remove by Admin ---
  async removeUserAdmin(id: string): Promise<Omit<User, 'passwordHash'>> {
      // Ensure user exists
      const userToRemove = await this.findOneById(id);

      // Prevent deleting the last admin? Or self-deletion? Add business logic checks.
      // Example: Check if trying to delete self
      // if (userPerformingAction.id === id) throw new BadRequestException("Cannot delete own account.");
      // Example: Check if last admin
      // if (userToRemove.role === Role.ADMIN) {
      //    const adminCount = await this.prisma.user.count({ where: { role: Role.ADMIN } });
      //    if (adminCount <= 1) throw new BadRequestException("Cannot delete the last admin account.");
      // }

      // Handle related data (tasks, incidents reported) based on schema onDelete behavior
      // Tasks -> SetNull, Incidents reported -> ??? (Schema needs onDelete for reporterId)
      // Add ON DELETE SET NULL or CASCADE to reporterId in Incident model if needed. For now, Prisma might prevent deletion if incidents exist.

      try {
           const deletedUser = await this.prisma.user.delete({
              where: { id },
               select: { // Return non-sensitive data
                  id: true, email: true, name: true, role: true, teamId: true,
                  createdAt: true, updatedAt: true,
               }
           });
           return deletedUser;
      } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
               // Handle foreign key constraints (e.g., if user reported incidents and no cascade is set)
               if (error.code === 'P2003') {
                   throw new ConflictException(`Cannot delete user. They may be associated with existing incidents or other records.`);
               }
          }
           console.error(`Error deleting user ${id} by admin:`, error);
           throw new Error('Could not delete user.');
      }
  }
  // -------------------------

  // async findOneById(id: string): Promise<User | null> {
  //   return this.prisma.user.findUnique({
  //     where: { id },
  //   });
  // }

  async findOneById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
    return user;
  }


  // async findOneByEmail(email: string): Promise<User | null> {
  //   return this.prisma.user.findUnique({
  //     where: { email },
  //   });
  // }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email: ${email} not found`);
    }
    return user;
  }


  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  // --- NEW Method for Admin UI ---
  async findAllLite(searchTerm?: string): Promise<Omit<User, 'passwordHash'>[]> {
    // Basic findMany, add where clause for searchTerm if implemented
    // Add take/skip for pagination later
    return this.prisma.user.findMany({
        select: { // Explicitly select non-sensitive fields
            id: true,
            email: true,
            name: true,
            role: true,
            teamId: true,
            createdAt: true,
            updatedAt: true,
            // DO NOT SELECT passwordHash
        },
        orderBy: { name: 'asc' } // Order by name
    });
}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    // Prisma automatically handles default values like createdAt, updatedAt, id, role
    return this.prisma.user.create({
      data,
    });
  }


  async update(id: string, data: UpdateUserDto): Promise<User> {
    // Ensure the user exists first.
    await this.findOneById(id);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    // Ensure the user exists before removing.
    await this.findOneById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Add other user-related methods as needed (update, delete, find all etc.)
}