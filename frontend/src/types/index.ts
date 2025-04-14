// frontend/src/types/index.ts

// Define based on Prisma schema / API responses
// Keep only fields needed by the frontend

export type UserSnippet = {
  id: string;
  name: string | null; // Prisma User name is not optional, but handle null just in case
  email: string;
};

// Match backend Enums (adjust if needed)
export enum IncidentSeverity {
  SEV1 = 'SEV1',
  SEV2 = 'SEV2',
  SEV3 = 'SEV3',
}

export enum IncidentStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  MITIGATING = 'MITIGATING',
  RESOLVED = 'RESOLVED',
  POSTMORTEM = 'POSTMORTEM',
}

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdById: string;
  teamId?: string | null;
  createdAt: string; // Dates usually come as ISO strings
  updatedAt: string;
  // Optional relations if included in API response
  createdBy?: UserSnippet;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  incidentId: string;
  senderId: string;
  createdAt: string; // ISO string
  // Include sender details if backend provides them
  sender: UserSnippet;
}

// For WebSocket status store
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';