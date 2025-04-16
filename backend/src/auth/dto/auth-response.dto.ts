// Structure must match exactly what the frontend `authorize` callback expects
import { Role } from "@prisma/client"; // Import Role enum if needed for typing

// Define the shape of the user object within the response
// Exclude sensitive fields like passwordHash
class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: Role; // Use Role enum type for clarity internally
    teamId?: string | null; // ADDED: Include teamId (optional)
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}