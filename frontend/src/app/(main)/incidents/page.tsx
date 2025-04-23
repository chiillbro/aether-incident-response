'use client'; // Mark as Client Component because we use hooks

import { useState } from 'react';
import { useIncidents } from '@/hooks/api/incidents/useIncidents';
import { IncidentList } from '@/components/incidents/IncidentList';
import { Button } from '@/components/ui/button';
import { CreateIncidentDialog } from '@/components/incidents/CreateIncidentDialog';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { AlertTriangle, PlusCircle, ShieldAlert } from 'lucide-react';
// SignOutButton is now in the sidebar layout

export default function Incidents() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleIncidentCreated = () => {
    setIsCreateDialogOpen(false);
    // Invalidate query via hook now, refetch might not be needed
    // refetch();
  };

  return (
    <div className="space-y-6"> {/* Use space-y for vertical spacing */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Current Incidents</h1>
        {/* TODO: Add RBAC check here if only specific roles can create */}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className='mr-2 h-4 w-4'/> Declare Incident
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
           <AlertTriangle className="h-5 w-5"/>
           <span>Error loading incidents: {error.message}</span>
           <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {!isLoading && !error && incidents && (
         <IncidentList incidents={incidents} />
      )}

      {!isLoading && !error && (!incidents || incidents.length === 0) && (
         <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-background">
             <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-semibold mb-2">No Active Incidents</h3>
             <p className="text-sm text-muted-foreground mb-4">Looks like things are calm right now.</p>
             <Button onClick={() => setIsCreateDialogOpen(true)}>Declare the First Incident</Button>
         </div>
      )}

      {/* SignOutButton is moved to the layout */}
      {/* <SignOutButton /> */}

      <CreateIncidentDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
}