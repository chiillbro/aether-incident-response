// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
// import { TeamsService } from './teams.service';
// import { CreateTeamDto } from './dto/create-team.dto';
// import { UpdateTeamDto } from './dto/update-team.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Assuming JWT guard is global or needed here
// // Consider adding role-based guards if needed (e.g., only ADMINs can manage teams)
// // import { RolesGuard } from 'src/auth/guards/roles.guard';
// // import { Roles } from 'src/auth/decorators/roles.decorator';
// // import { Role } from '@prisma/client';

// @UseGuards(JwtAuthGuard) // Apply auth guard to all routes in this controller
// @Controller('teams')
// export class TeamsController {
//   constructor(private readonly teamsService: TeamsService) {}

//   // POST /teams - Create a new team
//   // @Roles(Role.ADMIN) // Example: Restrict to ADMINs
//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   create(@Body() createTeamDto: CreateTeamDto) {
//     return this.teamsService.create(createTeamDto);
//   }

//   // GET /teams - Get all teams
//   @Get()
//   findAll() {
//     return this.teamsService.findAll();
//   }

//   // GET /teams/:id - Get a single team by ID
//   @Get(':id')
//   findOne(@Param('id', ParseUUIDPipe) id: string) {
//     return this.teamsService.findOne(id);
//   }

//   // PATCH /teams/:id - Update a team by ID
//   // @Roles(Role.ADMIN) // Example: Restrict to ADMINs
//   @Patch(':id')
//   update(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() updateTeamDto: UpdateTeamDto,
//   ) {
//     return this.teamsService.update(id, updateTeamDto);
//   }

//   // DELETE /teams/:id - Delete a team by ID
//   // @Roles(Role.ADMIN) // Example: Restrict to ADMINs
//   @Delete(':id')
//   @HttpCode(HttpStatus.OK) // Or HttpStatus.NO_CONTENT (204) if you don't return the deleted object
//   remove(@Param('id', ParseUUIDPipe) id: string) {
//     // Consider returning just a success message or status code instead of the deleted object
//     return this.teamsService.remove(id);
//   }
// }


// src/teams/teams.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ManageTeamUserDto } from './dto/manage-team-user.dto'; // <-- Import DTO
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Corrected spelling
import { RolesGuard } from 'src/auth/guards/roles.guard'; // <-- Import Guard
import { Roles } from 'src/auth/decorators/roles.decorator'; // <-- Import Decorator
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard) // Apply auth guard globally
@Controller('teams')
export class TeamsController {
constructor(private readonly teamsService: TeamsService) {}

// POST /teams
@Post()
// @UseGuards(RolesGuard) // Apply RolesGuard *after* JwtAuthGuard
@Roles(Role.ADMIN) // Only ADMINs can create teams
@HttpCode(HttpStatus.CREATED)
create(@Body() createTeamDto: CreateTeamDto) {
  return this.teamsService.create(createTeamDto);
}

// GET /teams
@Get()
findAll() {
  // All authenticated users can list teams? Or add role check?
  return this.teamsService.findAll();
}

// GET /teams/:id
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  // All authenticated users can view a specific team?
  return this.teamsService.findOne(id);
}

 // GET /teams/:id/members - NEW
 @Get(':id/members')
 findMembers(@Param('id', ParseUUIDPipe) id: string) {
     // Authorization? Should only team members or ADMIN see members? Let's restrict for now.
     // This needs refinement based on requirements - service could check user's team vs requested teamId
     return this.teamsService.findTeamMembers(id);
 }

// PATCH /teams/:id
@Patch(':id')
// @UseGuards(RolesGuard)
@Roles(Role.ADMIN) // Only ADMINs can update team details
update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateTeamDto: UpdateTeamDto,
) {
  return this.teamsService.update(id, updateTeamDto);
}

// DELETE /teams/:id
@Delete(':id')
// @UseGuards(RolesGuard)
@Roles(Role.ADMIN) // Only ADMINs can delete teams
@HttpCode(HttpStatus.OK)
remove(@Param('id', ParseUUIDPipe) id: string) {
  return this.teamsService.remove(id);
}

// --- User Management Endpoints ---

// POST /teams/:id/users - Add user to team
@Post(':id/users')
// @UseGuards(RolesGuard)
@Roles(Role.ADMIN) // Only ADMINs can add users to teams
@HttpCode(HttpStatus.OK) // Or CREATED if returning the user record seems like creation
addUser(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Body() manageTeamUserDto: ManageTeamUserDto,
) {
    return this.teamsService.addUserToTeam(teamId, manageTeamUserDto);
}

// DELETE /teams/:id/users/:userId - Remove user from team
@Delete(':id/users/:userId') // Use userId directly in path for RESTfulness
// @UseGuards(RolesGuard)
@Roles(Role.ADMIN) // Only ADMINs can remove users
@HttpCode(HttpStatus.OK)
removeUser(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string, // Get userId from param
) {
    // Create the DTO object from the param
    const manageTeamUserDto: ManageTeamUserDto = { userId };
    return this.teamsService.removeUserFromTeam(teamId, manageTeamUserDto);
}

}