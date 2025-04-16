import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users - Retrieve all users
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // GET /users/:id - Retrieve a user by id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  // POST /users - Create a new user
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createUserDto: Prisma.UserCreateInput): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // PUT /users/:id - Update an existing user
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id - Delete a user
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
