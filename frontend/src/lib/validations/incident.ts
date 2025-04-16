import { z } from 'zod';
import { IncidentSeverity } from '@/types'; // Import enum

export const createIncidentSchema = z.object({
    title: z
        .string()
        .min(3, { message: 'Title must be at least 3 characters' })
        .max(255, { message: 'Title must not exceed 255 characters' }),
    description: z
        .string()
        .max(2000, { message: 'Description must not exceed 2000 characters' })
        .optional()
        .nullable(), // Allow null if needed, or just optional
    severity: z.nativeEnum(IncidentSeverity, {
        errorMap: (issue, ctx) => ({ message: 'Please select a valid severity' })
    }), // Keep severity mandatory or make optional() if desired
    teamId: z // Add teamId validation
        .string({ required_error: 'Please select a team' }) // Error if field is missing entirely
        .uuid({ message: 'Invalid team selection' }) // Ensure it's a UUID
        .min(1, { message: 'Please select a team' }), // Ensure it's not empty after selection
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;