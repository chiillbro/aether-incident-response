// src/auth/gaurds/roles.guard.ts // Corrected spelling from 'gaurds'
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, User } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

     // If no roles are required, allow access (e.g., if only JwtAuthGuard is used)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user object attached by JwtAuthGuard
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Assuming JwtAuthGuard attaches the user object

    if (!user || !user.role) {
      // This shouldn't happen if JwtAuthGuard runs first, but good practice
      throw new ForbiddenException('User role not found or invalid authentication.');
    }

    // Check if the user's role is included in the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
         throw new ForbiddenException(`User role (${user.role}) is not authorized for this action. Required: ${requiredRoles.join(', ')}`);
    }

    return true; // User has one of the required roles
  }
}