// Structure must match exactly what the frontend `authorize` callback expects
// import { User as PrismaUser } from 'generated/prisma'; // Rename to avoid conflict

// Define the shape of the user object within the response
// Exclude sensitive fields like passwordHash
class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: string; // Use string representation of enum
    teamId?: string | null; // Make optional or null based on your schema/logic
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}