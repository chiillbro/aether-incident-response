// src/tasks/dto/assign-task.dto.ts
import { IsOptional, IsUUID } from 'class-validator';

export class AssignTaskDto {
    @IsUUID()
    @IsOptional() // Optional allows unassigning by sending null/undefined on PATCH
    assigneeId?: string | null; // Allow null to represent unassigning
}