import { IsEnum, IsNotEmpty } from "class-validator";
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentStatusDto {
  @IsNotEmpty()
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}