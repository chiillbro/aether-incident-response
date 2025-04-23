import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserAdminDto {
    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsUUID()
    @IsOptional() // Use null to explicitly unassign
    teamId?: string | null;

    // Add other fields admins can change (e.g., isActive?)
}