import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateTaskDto {
  
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  description: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}