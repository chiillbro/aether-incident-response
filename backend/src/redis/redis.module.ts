import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';

@Global() // Make RedisService globally available
@Module({
  imports: [
    ConfigModule // Needed to inject ConfigService for connection details
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
