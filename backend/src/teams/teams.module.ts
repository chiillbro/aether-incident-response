// import { Module } from '@nestjs/common';
// import { TeamsService } from './teams.service';
// import { TeamsController } from './teams.controller';
// import { PrismaService } from 'prisma/prisma.service';
// import { PrismaModule } from 'prisma/prisma.module';

// @Module({
//   providers: [TeamsService],
//   controllers: [TeamsController],
//   exports: [TeamsService], // Export service for EventsGateway to use
// })
// export class TeamsModule {}


// src/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from '../users/users.module'; // <-- Import UsersModule

@Module({
  imports: [
      PrismaModule,
      UsersModule, // <-- Add UsersModule to make UsersService available
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService], // Export if needed (e.g., by IncidentsService)
})
export class TeamsModule {}