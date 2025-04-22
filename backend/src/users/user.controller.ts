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
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users - Only accessible by ADMIN
  // TODO: Add pagination & search query params later for optimization
  @Get()
  // @Roles(Roles.ADMIN)
  async findAll(
    // Example Query Params (implement filtering in service later)
     // @Query('search') searchTerm?: string,
     // @Query('page') page: number = 1,
     // @Query('limit') limit: number = 20,
  ): Promise<Omit<User, 'passwordHash'>[]> {
    // Fetch users using the service, selecting only non-sensitive fields
    return this.usersService.findAllLite(); // Add this method to UsersService
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
