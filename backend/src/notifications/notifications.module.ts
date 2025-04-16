import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global() // Make NotificationsService available globally without importing module explicitly
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService] // Export Service
})
export class NotificationsModule {}
