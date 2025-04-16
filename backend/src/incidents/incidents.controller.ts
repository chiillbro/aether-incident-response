// import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseUUIDPipe, Patch, HttpCode, HttpStatus } from '@nestjs/common'; // Added PATCH, HttpCode, HttpStatus
// import { IncidentsService } from './incidents.service';
// import { CreateIncidentDto } from './dto/create-incident.dto';
// import { Request as ExpressRequest } from 'express';
// import { User as PrismaUser, IncidentStatus } from '@prisma/client'; // Added IncidentStatus
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// // import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto'; // Will create this later

// // Augment Express Request to include the user property attached by JwtAuthGuard
// interface RequestWithUser extends ExpressRequest {
//   user: PrismaUser;
// }

// @UseGuards(JwtAuthGuard)
// @Controller('incidents')
// export class IncidentsController {
//   constructor(private readonly incidentsService: IncidentsService) {}

//   // POST /incidents
//   @Post()
//   @HttpCode(HttpStatus.CREATED) // Set standard HTTP code for creation
//   create(
//     @Body() createIncidentDto: CreateIncidentDto, // Uses updated DTO
//     @Request() req: RequestWithUser,
//   ) {
//     const creator = req.user;
//     // Service method now expects DTO with teamId and uses reporterId internally
//     return this.incidentsService.create(createIncidentDto, creator);
//   }

//   // GET /incidents
//   @Get()
//   findAll(@Request() req: RequestWithUser) {
//      const user = req.user;
//      // Service method might now apply filtering based on user/team
//      return this.incidentsService.findAll(user);
//   }

//   // GET /incidents/:id
//   @Get(':id')
//   findOne(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Request() req: RequestWithUser,
//   ) {
//      const user = req.user;
//      // Service method includes authorization check
//      return this.incidentsService.findOneById(id, user);
//   }

//   // --- Phase 2: Add endpoint for status update ---
//   // Example: PATCH /incidents/:id/status - Requires a DTO for validation
//   /*
//   @Patch(':id/status')
//   updateStatus(
//       @Param('id', ParseUUIDPipe) id: string,
//       @Body() updateStatusDto: UpdateIncidentStatusDto, // Define this DTO later
//       @Request() req: RequestWithUser,
//   ) {
//       const user = req.user;
//       return this.incidentsService.updateStatus(id, updateStatusDto.status, user);
//   }
//   */

// }


// src/incidents/incidents.controller.ts
import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
  ParseUUIDPipe, Patch, HttpCode, HttpStatus, Delete // Added Delete
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto'; // <-- Import DTO
import { Request as ExpressRequest } from 'express';
import { User as PrismaUser, IncidentStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Corrected spelling
import { RolesGuard } from 'src/auth/guards/roles.guard'; // <-- Import RolesGuard
import { Roles } from 'src/auth/decorators/roles.decorator'; // <-- Import Roles decorator


interface RequestWithUser extends ExpressRequest {
user: PrismaUser;
}

@UseGuards(JwtAuthGuard) // Apply JWT guard globally to this controller
@Controller('incidents')
export class IncidentsController {
constructor(private readonly incidentsService: IncidentsService) {}

// POST /incidents
@Post()
@HttpCode(HttpStatus.CREATED)
create(
  @Body() createIncidentDto: CreateIncidentDto,
  @Request() req: RequestWithUser,
) {
  return this.incidentsService.create(createIncidentDto, req.user);
}

// GET /incidents
@Get()
findAll(@Request() req: RequestWithUser) {
  return this.incidentsService.findAll(req.user);
}

// GET /incidents/:id
@Get(':id')
findOne(
  @Param('id', ParseUUIDPipe) id: string,
  @Request() req: RequestWithUser,
) {
  // Service method includes authorization check
  return this.incidentsService.findOneById(id, req.user);
}

// --- Phase 2: Endpoint for status update ---
@Patch(':id/status')
@HttpCode(HttpStatus.OK)
// Optional: Add RolesGuard if only specific roles can update status
// @Roles(Role.ADMIN, Role.ENGINEER) // Example: Allow ADMIN and ENGINEER
// @UseGuards(RolesGuard)
updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateIncidentStatusDto, // Use the DTO
    @Request() req: RequestWithUser,
) {
    return this.incidentsService.updateStatus(id, updateStatusDto.status, req.user);
}

// Optional: DELETE /incidents/:id
// @Delete(':id')
// @Roles(Role.ADMIN) // Only Admins can delete
// @UseGuards(RolesGuard) // Apply RolesGuard AFTER JwtAuthGuard
// @HttpCode(HttpStatus.OK) // Or 204 No Content
// remove(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Request() req: RequestWithUser,
// ) {
//     return this.incidentsService.remove(id, req.user);
// }
}