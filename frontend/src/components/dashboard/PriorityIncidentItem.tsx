// frontend/src/components/dashboard/PriorityIncidentItem.tsx
import Link from 'next/link';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { getSeverityColor, getStatusColor } from '@/components/incidents/IncidentListItem'; // Re-use helpers
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ShieldAlert } from 'lucide-react';

interface PriorityIncidentItemProps {
  incident: Incident;
}

export function PriorityIncidentItem({ incident }: PriorityIncidentItemProps) {
  return (
    <Link href={`/incidents/${incident.id}`} passHref>
      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
        <div className="flex items-center gap-3 overflow-hidden">
           <TooltipProvider delayDuration={100}>
              <Tooltip>
                 <TooltipTrigger>
                     <ShieldAlert className={cn("h-5 w-5 flex-shrink-0", getSeverityColor(incident.severity).replace('bg-', 'text-').replace(' hover:bg-.*', ''))} />
                 </TooltipTrigger>
                 <TooltipContent>
                   Severity: {incident.severity}
                 </TooltipContent>
              </Tooltip>
           </TooltipProvider>
          <span className="text-sm font-medium truncate" title={incident.title}>
            {incident.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <Badge variant="outline" className={cn("text-xs h-5 px-1.5", getStatusColor(incident.status))}>
             {incident.status}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}