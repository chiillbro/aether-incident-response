import { Severity, Status } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  // Status will default to DETECTED in schema
  // @IsEnum(Status)
  // @IsOptional()
  // status?: Status;

  // teamId might be assigned based on user or context later 
  // @IsString()
  // @IsOptional()
  // teamId?: string;

}