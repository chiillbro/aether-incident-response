// frontend/src/app/(main)/admin/teams/page.tsx
'use client';
import { useState } from 'react';
import { useGetTeams } from '@/hooks/api/admin/useGetTeams';
import { TeamListTable } from '@/components/admin/teams/TeamListTable'; // Create this component
import { CreateTeamDialog } from '@/components/admin/teams/CreateTeamDialog'; // Create this
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, PlusCircle } from 'lucide-react';

export default function AdminTeamsPage() {
  const { data: teams, isLoading, error, refetch } = useGetTeams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Teams</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
           <PlusCircle className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}
      {error && (
         <div className="text-red-600 flex items-center gap-2">
             <AlertTriangle size={18}/> Error loading teams: {error.message}
             <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
         </div>
      )}
      {!isLoading && !error && teams && (
         <TeamListTable teams={teams} />
      )}

      <CreateTeamDialog
         isOpen={isCreateOpen}
         onOpenChange={setIsCreateOpen}
         onTeamCreated={() => setIsCreateOpen(false)} // Close dialog on success
      />
    </div>
  );
}