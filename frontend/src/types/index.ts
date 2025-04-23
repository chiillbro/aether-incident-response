// Define based on Prisma schema / API responses
// Keep only fields needed by the frontend

// --- Enums (Match Prisma Schema) ---
export enum Role {
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
}

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

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}


// --- Model Types (Based on Schema & API responses) ---

// export interface Incident {
//   id: string;
//   title: string;
//   description?: string | null;
//   severity: IncidentSeverity;
//   status: IncidentStatus;
//   createdById: string;
//   teamId?: string | null;
//   createdAt: string; // Dates usually come as ISO strings
//   updatedAt: string;
//   // Optional relations if included in API response
//   createdBy?: UserSnippet;
//   messages?: Message[];
// }

export type UserSnippet = {
  id: string;
  name: string;
  email: string;
  role?: Role; // Optional, include if needed
  teamId?: string | null; // Optional
  createdAt: string; // ISO string
};

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporterId: string; // Changed from createdById
  teamId: string; // Now required
  createdAt: string;
  updatedAt: string;


  // Optional relations (expand based on API response)
  reported?: UserSnippet; // Changed from createdBy
  team?: TeamSnippet;
  messages?: Message[];
  tasks?: Task[];
}

export interface Message {
  id: string;
  content: string;
  incidentId: string;
  senderId: string;
  createdAt: string; // ISO string

 // Include sender details if backend provides them
 sender: UserSnippet; // Assuming API includes this populated relation
 // incident?: Incident; // Optional, depending on API response
}

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  incidentId: string;
  assigneeId?: string | null; // Optional assignee
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Optional relations (expand based on API response)
  incident?: Incident;
  assignee?: UserSnippet | null; // Assignee can be null
}


// Add Team related types
export type TeamSnippet = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// Add full Team type if needed
export interface FullTeam extends TeamSnippet {
  users: UserSnippet[];
  incidents: Incident[];
}

// For WebSocket status store
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';