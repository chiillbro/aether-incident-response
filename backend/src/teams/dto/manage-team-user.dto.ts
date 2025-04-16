// src/teams/dto/manage-team-user.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ManageTeamUserDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}