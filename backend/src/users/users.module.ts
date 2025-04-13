import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// PrismaModule is global, no need to import here unless PrismaService isn't global

@Module({
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for AuthModule to use
})
export class UsersModule {}