import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import {TaskStatus} from '@prisma/client'

export class UpdateTaskDto {

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // Use a separate DTO/endpoint for assigning to keep things clean
  // @IsOptional()
  // @IsUUID()
  // assigneeId?: string | null; // Allow null to unassign
}