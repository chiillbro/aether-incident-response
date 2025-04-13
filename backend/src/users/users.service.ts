import { Injectable, NotFoundException } from '@nestjs/common';
// import { Prisma, User } from 'generated/prisma';
import { User, Prisma } from '@prisma/client'; // Correct import from node_modules
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    // Prisma automatically handles default values like createdAt, updatedAt, id, role
    return this.prisma.user.create({
      data,
    });
  }

  // Add other user-related methods as needed (update, delete, find all etc.)
}