import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { validationSchema } from './config/env.validation'; // Import the schema
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env', // Specify your env file
      validationSchema: validationSchema, // Apply validation
      // validationOptions: {
      //   allowUnknown: true, // Allow other env vars not defined in schema
      //   abortEarly: false, // Report all validation errors, not just the first
      // },
      // load: [configuration], // Optional: For custom config factories
    }),
    PrismaModule, // PrismaModule needs ConfigModule if it injects ConfigService
    AuthModule,
    UsersModule,
    // Add other modules (Incidents, Messages, etc.) later
  ],
  controllers: [], // Root controllers if any
  providers: [],   // Root providers if any
})
export class AppModule {}