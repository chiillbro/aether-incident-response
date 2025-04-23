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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FindAllTasksParams, TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Corrected spelling
import { Request as ExpressRequest } from 'express';
import { User as PrismaUser, TaskStatus } from '@prisma/client';
import { AssignTaskDto } from './dto/assign-task.dto';
import { OptionalParseEnumArrayPipe } from 'src/pipes/OptionalParseEnumArrayPipe';
// import { RolesGuard } from 'src/auth/gaurds/roles.guard'; // If specific roles needed
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { Role } from '@prisma/client';

// Augment Express Request type
interface RequestWithUser extends ExpressRequest {
  user: PrismaUser;
}

@UseGuards(JwtAuthGuard) // Ensure user is authenticated for all task routes
// @Controller('incidents/:incidentId/tasks') // Nested route structure
@Controller('tasks') // <-- Change base route to /tasks
export class TasksController {
constructor(private readonly tasksService: TasksService) {}


// --- NEW: Top-level GET /tasks with Query Params ---
@Get()
findAllTasks(
  @Request() req: RequestWithUser,
  @Query('assigneeId') assigneeId?: string, // Optional UUID filter
  @Query('incidentId') incidentId?: string, // Optional UUID filter
  @Query('status', new OptionalParseEnumArrayPipe(TaskStatus)) status?: TaskStatus[], // Custom pipe for array enum
  @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  @Query('sortBy', new DefaultValuePipe('createdAt:desc')) sortBy?: string, // Default sort
) {
  const params: FindAllTasksParams = { assigneeId, status, incidentId, limit, page, sortBy };
  // Pass the logged-in user for RBAC checks within the service
  return this.tasksService.findAll(params, req.user);
}
// -------------------------------------------------

// --- Keep old POST route for creating tasks *for a specific incident* ---
// POST /incidents/:incidentId/tasks - This is still logical for creation context
@Post(':incidentId')  // Keep nested for creation clarity
@HttpCode(HttpStatus.CREATED)
create(
  @Param('incidentId', ParseUUIDPipe) incidentId: string,
  @Body() createTaskDto: CreateTaskDto,
  @Request() req: RequestWithUser,
) {
  // Note: createTaskDto itself doesn't contain incidentId, it's from the param
  return this.tasksService.create(incidentId, createTaskDto, req.user);
}

// GET tasks
@Get(':incidentId')
findAll(
  @Param('incidentId', ParseUUIDPipe) incidentId: string,
  @Request() req: RequestWithUser,
) {
  return this.tasksService.findByIncident(incidentId, req.user);
}

// GET tasks/:taskId
@Get(':taskId/incidents/:incidentId')
findOne(
    @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context if needed, though service uses taskId
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Request() req: RequestWithUser,
) {
    // Service primarily needs taskId for lookup and permission check
    return this.tasksService.findOne(taskId, req.user);
}


// PATCH tasks/:taskId
@Patch(':taskId')
@HttpCode(HttpStatus.OK)
update(
    // @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context, though service uses taskId
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.update(taskId, updateTaskDto, req.user);
}

// PATCH tasks/:taskId/assign
@Patch(':taskId/assign')
@HttpCode(HttpStatus.OK)
assign(
    // @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() assignTaskDto: AssignTaskDto,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.assign(taskId, assignTaskDto, req.user);
}


// DELETE tasks/:taskId
// @Roles(Role.ADMIN) // Example: Only allow ADMINs to delete tasks? Or team leads?
// @UseGuards(RolesGuard)
@Delete(':taskId')
@HttpCode(HttpStatus.OK) // Or NO_CONTENT (204)
remove(
    // @Param('incidentId', ParseUUIDPipe) incidentId: string, // Keep for context
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Request() req: RequestWithUser,
) {
    return this.tasksService.remove(taskId, req.user);
}
}