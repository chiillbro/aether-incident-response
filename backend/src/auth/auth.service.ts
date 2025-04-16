import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
// import { Prisma } from '@prisma/client'; // Import Prisma namespace for error handling
import { RegisterDto } from './dto/register.dto';
// import { Prisma, User } from 'generated/prisma';
import { User, Prisma, Role } from '@prisma/client'; 

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
    
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user; // Exclude password hash from returned object
      return result;
    }
    // User not found or password doesn't match
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {

    const user = await this.usersService.findOneByEmail(loginDto.email); // Fetch the full user object

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Payload includes essential info for JWT strategy and potentially frontend use
    const payload = { email: user.email, sub: user.id, role: user.role, teamId: user.teamId }; // 'sub' standard for subject (user ID)
    const accessToken = this.jwtService.sign(payload);

    // Prepare user object for response (ensure no passwordHash)
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
    };

    return {
      user: userResponse,
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = registerDto;

   // 1. Check if user already exists (using findOneByEmail which throws NotFound, so we need to catch it)
   try {
    await this.usersService.findOneByEmail(email);
    // If found, throw conflict
    throw new ConflictException('Email address is already registered');
  } catch (error) {
    // If it's NotFoundException, that's good, continue. Otherwise, rethrow unexpected errors.
    if (!(error instanceof NotFoundException)) {
        if (error instanceof ConflictException) throw error; // Rethrow conflict if already thrown
         console.error('Unexpected error checking existing user:', error);
         throw new InternalServerErrorException();
    }
  }

    // 2. Hash the password
    const hashedPassword = await this.hashPassword(password);
    // try {
    //   hashedPassword = 
    // } catch (error) {
    //   console.error('Error hashing password:', error);
    //   throw new InternalServerErrorException('Could not process registration');
    // }


    // 3. Create the user in the database
    let newUser: User;
    try {
      newUser = await this.usersService.create({
        name,
        email,
        passwordHash: hashedPassword,
        // role defaults via Prisma schema
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

    // // 4. Automatically log the user in (generate JWT)
    // const { passwordHash, ...userPayload } = newUser; // Exclude hash for login payload
    // return this.login(userPayload);

    // 4. Generate JWT Payload & Token directly
    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role, teamId: newUser.teamId };
    const accessToken = this.jwtService.sign(payload);

    // 5. Prepare response DTO
    const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        teamId: newUser.teamId,
    };

    return {
        user: userResponse,
        accessToken,
    };
  }
}