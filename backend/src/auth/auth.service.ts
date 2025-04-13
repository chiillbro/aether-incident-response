import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
// import { Prisma } from '@prisma/client'; // Import Prisma namespace for error handling
import { RegisterDto } from './dto/register.dto';
// import { Prisma, User } from 'generated/prisma';
import { User, Prisma } from '@prisma/client'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Standard number of salt rounds
    return bcrypt.hash(password, saltRounds);
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      console.log('User not found for email:', email);
      return null;
    }
  
    console.log('Stored hash:', user.passwordHash);
    console.log('Password comparison result:', await bcrypt.compare(pass, user.passwordHash))
    
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      // Passwords match
      const { passwordHash, ...result } = user; // Exclude password hash from returned object
      return result;
    }
    // User not found or password doesn't match
    return null;
  }

  async login(user: Omit<User, 'passwordHash'>): Promise<AuthResponseDto> {
    // Payload includes essential info for JWT strategy and potentially frontend use
    const payload = { email: user.email, sub: user.id, role: user.role }; // 'sub' standard for subject (user ID)
    const accessToken = this.jwtService.sign(payload);

    // Prepare user object for response (ensure no passwordHash)
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toString(), // Ensure role is string if enum
        teamId: user.teamId,
    };

    return {
      user: userResponse,
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = registerDto;

    // 1. Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    // 2. Hash the password
    let hashedPassword;
    try {
      hashedPassword = await this.hashPassword(password);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new InternalServerErrorException('Could not process registration');
    }

    console.log('Raw password:', password);
    console.log('Hashed password:', hashedPassword);


    // 3. Create the user in the database
    let newUser: User;
    try {
      newUser = await this.usersService.create({
        name,
        email,
        passwordHash: hashedPassword,
        // Prisma handles default role ('ENGINEER' from schema)
      });
    } catch (error) {
        // Catch potential Prisma unique constraint errors (though checked above, belt-and-suspenders)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation code
            throw new ConflictException('Email address is already registered (database constraint).');
        }
      }
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Could not register user');
    }

    // 4. Automatically log the user in (generate JWT)
    const { passwordHash, ...userPayload } = newUser; // Exclude hash for login payload
    return this.login(userPayload);
  }
}