// frontend/src/app/(main)/dashboard/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useIncidents } from '@/hooks/api/incidents/useIncidents';
import { useGetMyOpenTasks } from '@/hooks/api/tasks/useGetMyOpenTasks'; // Import new hook
import { StatCard } from '@/components/dashboard/StatCard';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { PriorityIncidentItem } from '@/components/dashboard/PriorityIncidentItem';
import { CreateIncidentDialog } from '@/components/incidents/CreateIncidentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Role, IncidentSeverity, IncidentStatus } from '@/types'; // Import enums
import {
    AlertTriangle, PlusCircle, ListTodo, ShieldAlert, Users, Building, LayoutList, Activity, Wrench
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role as Role | undefined;

  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);

  // Fetch data using hooks
  const { data: incidentsData, isLoading: isLoadingIncidents, error: incidentsError } = useIncidents();
  const { data: myOpenTasksData, isLoading: isLoadingTasks, error: tasksError } = useGetMyOpenTasks();

  // Memoized calculations for stats and lists
  const { activeIncidents, criticalIncidents } = useMemo(() => {
    if (!incidentsData) return { activeIncidents: 0, criticalIncidents: [] };
    const active = incidentsData.filter(inc =>
        inc.status !== IncidentStatus.RESOLVED && inc.status !== IncidentStatus.POSTMORTEM
    );
    // Show highest severity first, then newest within severity
    const critical = active
        .filter(inc => inc.severity === IncidentSeverity.SEV1 || inc.severity === IncidentSeverity.SEV2)
        .sort((a, b) => {
             // Sort SEV1 before SEV2
             if (a.severity === IncidentSeverity.SEV1 && b.severity !== IncidentSeverity.SEV1) return -1;
             if (a.severity !== IncidentSeverity.SEV1 && b.severity === IncidentSeverity.SEV1) return 1;
             // Then sort by creation date (newest first)
             return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 5); // Limit to top 5 for dashboard feed

    return { activeIncidents: active.length, criticalIncidents: critical };
  }, [incidentsData]);

  const myOpenTasksCount = useMemo(() => myOpenTasksData?.length ?? 0, [myOpenTasksData]);

  const handleIncidentCreated = () => {
    setIsCreateIncidentOpen(false);
    // React Query hooks handle cache invalidation, no need to manually refetch usually
  };

  const isLoading = isLoadingIncidents || isLoadingTasks; // Combine loading states

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aether Command Center</h1>
            <p className="text-muted-foreground">Overview of current incident status and actions.</p>
        </div>
        {/* Add any header actions if needed, like date range selectors later */}
      </div>

      <Separator />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* --- Stats Cards --- */}
        <StatCard
          title="Active Incidents"
          value={isLoadingIncidents ? undefined : activeIncidents}
          icon={ShieldAlert}
          isLoading={isLoadingIncidents}
          href="/incidents" // Link to the full incident list (which is this page for now)
          colorClassName={activeIncidents > 0 ? 'text-destructive' : 'text-muted-foreground'}
        />
        <StatCard
          title="My Open Tasks"
          value={isLoadingTasks ? undefined : myOpenTasksCount}
          icon={ListTodo}
          isLoading={isLoadingTasks}
          href="/tasks" // Link to user's task page (create later)
          colorClassName={myOpenTasksCount > 0 ? 'text-blue-500' : 'text-muted-foreground'}
        />
        {/* Add more StatCards here if relevant data becomes available */}
        {/* Example: <StatCard title="Teams" value={...} icon={Building} isLoading={...} href="/admin/teams" /> */}


        {/* --- Action Cards --- */}
        {/* Using grid layout within the action card area */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
                title="Declare Incident"
                description="Start the response process for a new issue."
                buttonText="Declare New Incident"
                icon={PlusCircle}
                onClick={() => setIsCreateIncidentOpen(true)}
                variant="default"
                // Add disabled logic based on role if needed
            />
            <ActionCard
                title="View All Incidents"
                description="See the full list of ongoing and past incidents."
                buttonText="Go to Incidents"
                icon={LayoutList}
                href="/incidents" // Current page shows the list below
                variant="outline"
            />
             {/* Admin Only Actions */}
             {currentUserRole === Role.ADMIN && (
                 <>
                    <ActionCard
                        title="Manage Teams"
                        description="Administer teams and memberships."
                        buttonText="Go to Teams"
                        icon={Building}
                        href="/admin/teams"
                        variant="outline"
                    />
                    <ActionCard
                        title="Manage Users"
                        description="Administer user accounts and roles."
                        buttonText="Go to Users"
                        icon={Users}
                        href="/admin/users" // Create this page later
                        variant="outline"
                    />
                </>
             )}
        </div>


        {/* --- Priority Incident Feed --- */}
        <Card className="lg:col-span-3 xl:col-span-2"> {/* Spans more columns on larger screens */}
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5'/> Priority Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-3 pb-3">
                {isLoadingIncidents && (
                    <div className='space-y-2'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                )}
                {incidentsError && (
                     <div className="text-red-600 text-sm flex items-center gap-2">
                         <AlertTriangle size={16}/> Error loading incidents: {incidentsError.message}
                     </div>
                )}
                {!isLoadingIncidents && !incidentsError && criticalIncidents.length === 0 && (
                     <p className="text-sm text-center text-muted-foreground py-4">No critical incidents currently active.</p>
                )}
                 {!isLoadingIncidents && !incidentsError && criticalIncidents.map(inc => (
                    <PriorityIncidentItem key={inc.id} incident={inc} />
                 ))}
                 {/* Add a "View All" link if the list is longer */}
                 {!isLoadingIncidents && !incidentsError && incidentsData && incidentsData.length > criticalIncidents.length && (
                     <div className='text-center mt-2'>
                         <Button variant="link" size="sm" asChild>
                             <Link href="/dashboard">View all incidents...</Link>
                         </Button>
                     </div>
                 )}
            </CardContent>
        </Card>

         {/* Placeholder for other sections like "My Open Tasks" list */}
         {/* <Card className="lg:col-span-1"> ... </Card> */}

      </div>

      {/* Declare Incident Dialog */}
      <CreateIncidentDialog
        isOpen={isCreateIncidentOpen}
        onOpenChange={setIsCreateIncidentOpen}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
}