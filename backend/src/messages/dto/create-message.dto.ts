import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsUUID()
  @IsNotEmpty()
  incidentId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;
}