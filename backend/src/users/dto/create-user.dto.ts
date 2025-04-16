import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  // For security reasons, you might require password hashing outside the DTO.
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
