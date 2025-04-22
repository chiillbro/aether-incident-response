// src/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Corrected spelling
import { Request as ExpressRequest } from 'express';
import { User as PrismaUser } from '@prisma/client';
import { AssignTaskDto } from './dto/assign-task.dto';
// import { RolesGuard } from 'src/auth/gaurds/roles.guard'; // If specific roles needed
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { Role } from '@prisma/client';

// Augment Express Request type
interface RequestWithUser extends ExpressRequest {
  user: PrismaUser;
}

@UseGuards(JwtAuthGuard) // Ensure user is authenticated for all task routes
@Controller('incidents/:incidentId/tasks') // Nested route structure
export class TasksController {
constructor(private readonly tasksService: TasksService) {}

// POST /incidents/:incidentId/tasks
@Post()
@HttpCode(HttpStatus.CREATED)
create(
  @Param('incidentId', ParseUUIDPipe) incidentId: string,
  @Body() createTaskDto: CreateTaskDto,
  @Request() req: RequestWithUser,
) {
  return this.tasksService.create(incidentId, createTaskDto, req.user);
}

// GET /incidents/:incidentId/tasks
@Get()
findAll(
  @Param('incidentId', ParseUUIDPipe) incidentId: string,
  @Request() req: RequestWithUser,
) {
  return this.tasksService.findByIncident(incidentId, req.user);
}

// GET /incidents/:incidentId/tasks/:taskId
@Get(':taskId')
findOne(
    @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context if needed, though service uses taskId
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Request() req: RequestWithUser,
) {
    // Service primarily needs taskId for lookup and permission check
    return this.tasksService.findOne(taskId, req.user);
}


// PATCH /incidents/:incidentId/tasks/:taskId
@Patch(':taskId')
@HttpCode(HttpStatus.OK)
update(
    @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context, though service uses taskId
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.update(taskId, updateTaskDto, req.user);
}

// PATCH /incidents/:incidentId/tasks/:taskId/assign
@Patch(':taskId/assign')
@HttpCode(HttpStatus.OK)
assign(
    @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() assignTaskDto: AssignTaskDto,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.assign(taskId, assignTaskDto, req.user);
}


// DELETE /incidents/:incidentId/tasks/:taskId
// @Roles(Role.ADMIN) // Example: Only allow ADMINs to delete tasks? Or team leads?
// @UseGuards(RolesGuard)
@Delete(':taskId')
@HttpCode(HttpStatus.OK) // Or NO_CONTENT (204)
remove(
    @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.remove(taskId, req.user);
}
}