import { Injectable, NotFoundException } from '@nestjs/common';
// import { Prisma, User } from 'generated/prisma';
import { User, Prisma } from '@prisma/client'; // Correct import from node_modules
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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