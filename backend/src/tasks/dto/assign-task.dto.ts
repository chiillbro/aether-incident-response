// src/tasks/dto/assign-task.dto.ts
import { IsOptional, IsUUID } from 'class-validator';

export class AssignTaskDto {
    @IsOptional() // Optional allows unassigning by sending null/undefined on PATCH
    @IsUUID()
    assigneeId?: string | null; // Allow null to represent unassigning
}