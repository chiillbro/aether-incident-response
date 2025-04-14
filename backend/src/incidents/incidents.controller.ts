import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { Request as ExpressRequest } from 'express'; // Import Express Request type
import { User as PrismaUser } from '@prisma/client'; // Import Prisma User type
import { JwtAuthGuard } from 'src/auth/gaurds/jwt-auth.guard';

// Augment Express Request to include the user property attached by JwtAuthGuard
interface RequestWithUser extends ExpressRequest {
  user: PrismaUser; // Define the user type based on your Prisma model
}

@UseGuards(JwtAuthGuard) // Apply guard to the entire controller
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  // POST /incidents
  @Post()
  create(
    @Body() createIncidentDto: CreateIncidentDto,
    @Request() req: RequestWithUser, // Use augmented Request type
  ) {
    // The user object is attached by the JwtAuthGuard/JwtStrategy
    const creator = req.user;
    return this.incidentsService.create(createIncidentDto, creator);
  }

  // GET /incidents
  @Get()
  findAll(@Request() req: RequestWithUser) {
     const user = req.user;
     return this.incidentsService.findAll(user);
  }

  // GET /incidents/:id
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string, // Validate ID is a UUID
    @Request() req: RequestWithUser,
  ) {
     const user = req.user;
     return this.incidentsService.findOneById(id, user);
  }

  // --- Add PATCH / DELETE endpoints later ---
  // @Patch(':id')
  // update(...) {}

  // @Delete(':id')
  // remove(...) {}
}