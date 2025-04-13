import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // Correct path
import { jwtConstants } from '../../common/constants/auth.constants'; // Import constants

// Define the shape of the JWT payload
interface JwtPayload {
  sub: string; // Standard JWT field for subject (user ID)
  email: string;
  // Add other fields you included during JWT signing (e.g., role)
  role?: string; // If role is included in JWT
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // Default strategy name is 'jwt'
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts token from "Bearer <token>" header
      ignoreExpiration: false, // Ensure expired tokens are rejected
      secretOrKey: configService.get<string>(jwtConstants.secretKey)!, // Get secret from config
    });
  }

  // This method is called after the token is verified (signature, expiration)
  async validate(payload: JwtPayload): Promise<any> {
    // console.log('JWT Payload received in validate:', payload);
    // Payload contains { sub: userId, email: userEmail, iat: issuedAt, exp: expiresAt }
    // You can optionally fetch the user from DB here to ensure they still exist/are active
    const user = await this.usersService.findOneById(payload.sub); // 'sub' should contain the user ID
    if (!user) {
      console.warn(`JWT Validation Failed: User with ID ${payload.sub} not found.`);
      throw new UnauthorizedException('User not found or invalid token.');
    }

    // Check if user account is active, etc. if needed

    // Return the user object (or parts of it) to be attached to request.user
    // Exclude sensitive information like passwordHash
    const { passwordHash, ...result } = user;
    // console.log('JWT Validation Success: Attaching user to request:', result);
    return result; // This object becomes `request.user` in controllers
  }
}