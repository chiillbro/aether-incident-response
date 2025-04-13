import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule/Service
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../common/constants/auth.constants'; // Import constants

@Module({
  imports: [
    UsersModule, // Make UsersService available for injection
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register Passport with default JWT strategy
    JwtModule.registerAsync({ // Configure JWT module asynchronously
      imports: [ConfigModule], // Make ConfigService available inside registerAsync
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(jwtConstants.secretKey), // Get secret from .env
        signOptions: {
          expiresIn: configService.get<string>(jwtConstants.expiresInKey), // Get expiration from .env
        },
      }),
    }),
    ConfigModule, // Ensure ConfigModule is imported if not global or implicitly available
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Provide the strategy for PassportModule to use
    // JwtAuthGuard is typically provided where used (@UseGuards) or globally
  ],
  exports: [AuthService, JwtModule], // Export if needed by other modules
})
export class AuthModule {}