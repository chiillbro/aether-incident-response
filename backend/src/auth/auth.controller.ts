import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import {Request as ExpressRequest} from 'express';
import { User } from '@prisma/client';

// Define RequestWithUser if needed for other routes like profile
interface RequestWithUser extends ExpressRequest {
  user: Omit<User, 'passwordHash'>; // Or the type provided by your JwtStrategy
}
@Controller('auth') // Base path for all routes in this controller
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login
  @Public() // Mark this route as public (doesn't require JWT Guard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 OK on successful login (NestJS default is 201 for POST)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // validateUser returns the user object (without hash) or null
    // const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    // if (!user) {
    //   // Throw standard NestJS exception, it handles the 401 response
    //   throw new UnauthorizedException('Invalid credentials');
    // }
    // If validation passes, generate JWT and return response
    return this.authService.login(loginDto);
  }

  // POST /auth/register
  @Public() // Mark this route as public
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Return 201 Created for successful registration
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Service handles hashing, user creation, potential conflicts, and JWT generation
    return this.authService.register(registerDto);
  }

  // Example Protected Route: GET /auth/profile
  @UseGuards(JwtAuthGuard) // Apply the JWT guard here
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) { // Use augmented type
    // req.user is populated by JwtStrategy's validate method
    
    // Thanks to JwtStrategy's validate method, req.user contains the authenticated user object
    // console.log('User accessing profile:', req.user.email);
    // The guard and strategy already excluded the passwordHash
    return req.user;
  }
}