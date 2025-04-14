import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Module({
  providers: [MessagesService],
  exports: [MessagesService], // Export service for EventsGateway to use
})
export class MessagesModule {}