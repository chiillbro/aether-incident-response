import { Incident } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns'; // For better date formatting
import { cn } from '@/lib/utils';
// Re-use helpers from IncidentListItem or define here
import { getStatusColor, getSeverityColor } from './IncidentListItem'; // Adjust path if needed

interface IncidentDetailsProps {
  incident: Incident;
}

export function IncidentDetails({ incident }: IncidentDetailsProps) {
  return (
     <div>
         <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">{incident.title}</h1>
         <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span>Opened: {format(new Date(incident.createdAt), 'PPpp')}</span>
            {/* You might want to fetch and display creator name later */}
            {/* <span>by {incident.createdBy?.name || 'Unknown'}</span> */}
         </div>
         <div className="flex items-center gap-3 mb-6">
              <Badge className={cn("text-sm", getStatusColor(incident.status))}>
                  {incident.status}
              </Badge>
              <Badge variant="outline" className={cn("text-sm", getSeverityColor(incident.severity))}>
                  {incident.severity}
              </Badge>
              {/* Add Team Badge if applicable */}
               {/* {incident.teamId && <Badge variant="secondary">Team: {incident.teamId}</Badge>} */}
         </div>
         {incident.description && (
             <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                 <p>{incident.description}</p>
             </div>
         )}
     </div>
  );
}