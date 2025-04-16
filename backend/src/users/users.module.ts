import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
// PrismaModule is global, no need to import here unless PrismaService isn't global

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UserController], // Export UsersService for AuthModule to use
})
export class UsersModule {}