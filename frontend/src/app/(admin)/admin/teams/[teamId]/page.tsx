// frontend/src/app/(admin)/admin/teams/[teamId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetTeamById } from '@/hooks/api/admin/useGetTeamById';
import { useGetTeamMembers } from '@/hooks/api/admin/useGetTeamMembers';
import { TeamMembersTable } from '@/components/admin/teams/TeamMembersTable';
import { AddTeamMember } from '@/components/admin/teams/AddTeamMember'; // Create this
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowLeft, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AdminTeamDetailPage() {
  const params = useParams();
  const teamId = typeof params.teamId === 'string' ? params.teamId : null;

  const {
    data: team,
    isLoading: isLoadingTeam,
    error: teamError,
    refetch: refetchTeam
  } = useGetTeamById(teamId);

  const {
      data: members,
      isLoading: isLoadingMembers,
      error: membersError,
      refetch: refetchMembers
  } = useGetTeamMembers(teamId);

  // --- Loading State ---
  if (isLoadingTeam) {
    return (
        <div className="space-y-6 animate-pulse p-4 md:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/4 mb-4" /> {/* Back button */}
            <Skeleton className="h-10 w-1/2" /> {/* Title */}
            <Skeleton className="h-6 w-3/4 mb-6" /> {/* Description */}
            <Skeleton className="h-8 w-40 mb-4" /> {/* Members title */}
            <Skeleton className="h-48 w-full" /> {/* Members table */}
            <Skeleton className="h-10 w-32" /> {/* Add member button */}
        </div>
    );
  }

  // --- Error State ---
  if (teamError || !team) {
    return (
       <div className="p-4 md:p-6 lg:p-8">
           <Button variant="outline" size="sm" asChild className='mb-4'>
                <Link href="/admin/teams"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams</Link>
           </Button>
          <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-3">
             <AlertTriangle className="h-6 w-6 flex-shrink-0"/>
             <div className='flex-grow'>
                 <p className='font-semibold'>Error Loading Team</p>
                 <p className='text-sm'>
                    {teamError?.message || 'The requested team could not be found.'}
                 </p>
             </div>
             <Button variant="outline" size="sm" onClick={() => refetchTeam()} className="ml-auto">Retry</Button>
          </div>
       </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="space-y-6 p-1"> {/* Reduced padding for nested cards */}
        <Button variant="outline" size="sm" asChild className='mb-4'>
            <Link href="/admin/teams"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams List</Link>
        </Button>

        <Card>
            <CardHeader>
                <CardTitle className='text-2xl'>{team.name} Team</CardTitle>
                <CardDescription>Manage team members and settings.</CardDescription>
            </CardHeader>
            {/* Add team settings/details here if needed later */}
        </Card>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                     <div className='flex items-center gap-2'>
                         <Users className='h-5 w-5 text-muted-foreground'/>
                         <CardTitle>Team Members ({members?.length ?? 0})</CardTitle>
                     </div>
                     <AddTeamMember teamId={team.id} currentMembers={members ?? []} />
                </div>
            </CardHeader>
            <CardContent>
                 {isLoadingMembers && <Skeleton className="h-40 w-full" />}
                 {membersError && (
                      <div className="text-red-600 text-sm flex items-center gap-2">
                         <AlertTriangle size={16}/> Error loading members: {membersError.message}
                         <Button variant="ghost" size="sm" onClick={() => refetchMembers()}>Retry</Button>
                      </div>
                 )}
                 {!isLoadingMembers && !membersError && (
                     <TeamMembersTable teamId={team.id} members={members ?? []} />
                 )}
            </CardContent>
        </Card>

    </div>
  );
}