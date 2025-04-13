import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core'; // Import Reflector
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Import key

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { // Inject Reflector
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // console.log('JwtAuthGuard: Public route, skipping JWT check.');
      return true; // Allow access without JWT validation
    }
    // If not public, proceed with default JWT validation
    // console.log('JwtAuthGuard: Protected route, proceeding with JWT check.');
    return super.canActivate(context);
  }

  // handleRequest remains the same
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any): any {
    if (err || !user) {
        // console.error('JwtAuthGuard handleRequest Error:', err || info?.message);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized access');
    }
    // console.log('JwtAuthGuard handleRequest Success: User authenticated:', user.email);
    return user;
  }
}