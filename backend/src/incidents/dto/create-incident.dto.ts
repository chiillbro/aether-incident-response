import { IncidentSeverity } from "@prisma/client";
import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  @IsNotEmpty()
  severity: IncidentSeverity;

  // Status will default to DETECTED in schema, typically not set on creation.
  // Remove status property from Create DTO to rely on schema default.

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  teamId: string;

}