import { z } from 'zod';
import { IncidentSeverity } from '@/types'; // Import enum if needed

export const createIncidentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(255),
  description: z.string().max(2000).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(), // Use nativeEnum for Prisma enums
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;