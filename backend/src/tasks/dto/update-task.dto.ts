import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import {TaskStatus} from '@prisma/client'

export class UpdateTaskDto {

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(500)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  // Use a separate DTO/endpoint for assigning to keep things clean
  // @IsOptional()
  // @IsUUID()
  // assigneeId?: string | null; // Allow null to unassign
}