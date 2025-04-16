// frontend/src/components/incidents/UpdateStatusControl.tsx
import { Incident, IncidentStatus, Role } from '@/types';
import { useUpdateIncidentStatus } from '@/hooks/api/incidents/useUpdateIncidentStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { getStatusColor } from './IncidentListItem'; // Reuse color helper

interface UpdateStatusControlProps {
  incident: Incident;
}

// Basic client-side transition rules (mirror backend or simplify)
const allowedTransitions: Partial<Record<IncidentStatus, IncidentStatus[]>> = {
    [IncidentStatus.DETECTED]: [IncidentStatus.INVESTIGATING],
    [IncidentStatus.INVESTIGATING]: [IncidentStatus.MITIGATING, IncidentStatus.RESOLVED, IncidentStatus.POSTMORTEM],
    [IncidentStatus.MITIGATING]: [IncidentStatus.RESOLVED, IncidentStatus.INVESTIGATING],
    [IncidentStatus.RESOLVED]: [IncidentStatus.POSTMORTEM, IncidentStatus.INVESTIGATING],
    [IncidentStatus.POSTMORTEM]: [],
};

export function UpdateStatusControl({ incident }: UpdateStatusControlProps) {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role as Role | undefined;

  const { mutate: updateStatus, isPending } = useUpdateIncidentStatus(incident.id);

  const handleStatusChange = (newStatus: string) => {
    // Ensure it's a valid IncidentStatus enum value before calling mutate
    if (Object.values(IncidentStatus).includes(newStatus as IncidentStatus)) {
      updateStatus(newStatus as IncidentStatus);
    } else {
        console.error("Invalid status selected:", newStatus);
    }
  };

  // Determine if the current user can update status (basic RBAC)
  // More complex: Check if user is on the incident.teamId if not ADMIN
  const canUpdateStatus = currentUserRole === Role.ADMIN || (currentUserRole === Role.ENGINEER && session?.user?.teamId === incident.teamId);

  const currentAllowed = allowedTransitions[incident.status] ?? [];

  return (
    <Select
      value={incident.status}
      onValueChange={handleStatusChange}
      disabled={isPending || !canUpdateStatus} // Disable if mutating or no permission
    >
      <SelectTrigger
        className={cn(
            "w-full",
            !canUpdateStatus && "cursor-not-allowed opacity-70",
            // Apply current status color dynamically? Might be too much.
            // getStatusColor(incident.status) // Example - might need text color adjustment
        )}
        aria-label="Update incident status"
       >
        <SelectValue placeholder="Change status..." />
      </SelectTrigger>
      <SelectContent>
        {Object.values(IncidentStatus).map((status) => {
          const isAllowed = status === incident.status || currentAllowed.includes(status);
          return (
            <SelectItem
              key={status}
              value={status}
              disabled={!isAllowed || !canUpdateStatus} // Disable if not current, not allowed, or no permission
              className={cn(!isAllowed && "text-muted-foreground opacity-60")}
            >
              {status}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}