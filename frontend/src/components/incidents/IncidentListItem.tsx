import Link from 'next/link';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { cn } from '@/lib/utils'; // For conditional classes
import { Users } from 'lucide-react';

interface IncidentListItemProps {
  incident: Incident;
}

// Helper function for badge colors (customize as needed)
export const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
        case IncidentStatus.DETECTED: return 'bg-yellow-500 hover:bg-yellow-600';
        case IncidentStatus.INVESTIGATING: return 'bg-blue-500 hover:bg-blue-600';
        case IncidentStatus.MITIGATING: return 'bg-orange-500 hover:bg-orange-600';
        case IncidentStatus.RESOLVED: return 'bg-green-500 hover:bg-green-600';
        case IncidentStatus.POSTMORTEM: return 'bg-gray-500 hover:bg-gray-600';
        default: return 'bg-gray-400';
    }
};
export const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
        case IncidentSeverity.SEV1: return 'bg-red-600 hover:bg-red-700 text-white';
        case IncidentSeverity.SEV2: return 'bg-orange-500 hover:bg-orange-600 text-white';
        case IncidentSeverity.SEV3: return 'bg-yellow-400 hover:bg-yellow-500 text-black';
        default: return 'bg-gray-400';
    }
};


export function IncidentListItem({ incident }: IncidentListItemProps) {
//   return (
//     <Link href={`/incidents/${incident.id}`} passHref>
//        <Card className="hover:shadow-md transition-shadow cursor-pointer">
//           <CardHeader className="pb-2">
//              <CardTitle className="text-lg font-medium truncate">{incident.title}</CardTitle>
//           </CardHeader>
//           <CardContent className="flex justify-between items-center pt-2">
//              <div className="flex items-center gap-2">
//                 <Badge className={cn("text-xs", getStatusColor(incident.status))}>
//                     {incident.status}
//                 </Badge>
//                 <Badge variant="outline" className={cn("text-xs", getSeverityColor(incident.severity))}>
//                     {incident.severity}
//                 </Badge>
//              </div>
//              <span className="text-xs text-gray-500">
//                 Opened {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
//              </span>
//           </CardContent>
//        </Card>
//     </Link>
//   );
// }

return (
  <Link href={`/incidents/${incident.id}`} passHref>
     <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200">
        <CardHeader className="pb-2 pt-3 px-4">
           <CardTitle className="text-base font-semibold truncate leading-tight">{incident.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={cn("text-xs px-1.5 py-0.5", getStatusColor(incident.status))}>
                      {incident.status}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 border", getSeverityColor(incident.severity))}>
                      {incident.severity}
                  </Badge>
                   {/* --- ADDED: Team Badge --- */}
                   {incident.team && (
                       <Badge variant="secondary" className='text-xs px-1.5 py-0.5 font-normal'>
                          <Users className='h-2.5 w-2.5 mr-1'/>
                          {incident.team.name}
                       </Badge>
                    )}
                   {/* --- END ADDED --- */}
              </div>
           </div>
           <div className='flex justify-end'>
              <span className="text-xs text-muted-foreground">
                  Opened {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
              </span>
           </div>
        </CardContent>
     </Card>
  </Link>
);
}