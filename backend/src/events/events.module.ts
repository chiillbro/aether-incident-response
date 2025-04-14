import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessagesModule } from '../messages/messages.module'; // Import MessagesModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for JwtService
import { UsersModule } from '../users/users.module'; // Import UsersModule for UsersService
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule

@Module({
  imports: [
      MessagesModule, // Make MessagesService available
      AuthModule,     // Make JwtService available
      UsersModule,    // Make UsersService available
      ConfigModule,   // Make ConfigService available
  ],
  providers: [EventsGateway],
})
export class EventsModule {}