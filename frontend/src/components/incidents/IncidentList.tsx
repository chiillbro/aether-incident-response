import { Incident } from '@/types';
import { IncidentListItem } from './IncidentListItem';

interface IncidentListProps {
  incidents: Incident[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  return (
    <div className="space-y-4 flex flex-col">
      {incidents.map((incident) => (
        <IncidentListItem key={incident.id} incident={incident} />
      ))}
    </div>
  );
}