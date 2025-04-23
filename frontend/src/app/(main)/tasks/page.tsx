// frontend/src/app/(main)/tasks/page.tsx
'use client';

import { useMemo } from 'react';
import { useGetMyOpenTasks } from '@/hooks/api/tasks/useGetMyOpenTasks';
import { Task, Incident } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, ListTodo, NotebookPen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskListItem } from '@/components/tasks/TaskListItem'; // Create this component
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Interface to represent tasks grouped by incident
interface GroupedTasks {
    [incidentId: string]: {
        incident: Pick<Incident, 'id' | 'title'>; // Store basic incident info
        tasks: Task[];
    }
}

export default function MyTasksPage() {
    const { data: tasks, isLoading, error, refetch } = useGetMyOpenTasks();

    // Group tasks by incident using useMemo
    const groupedTasks = useMemo((): GroupedTasks => {
        if (!tasks) return {};
        return tasks.reduce((acc, task) => {
            if (!task.incident) return acc; // Skip tasks without incident relation (shouldn't happen)
            const incidentId = task.incident.id;
            if (!acc[incidentId]) {
                acc[incidentId] = {
                    incident: { id: task.incident.id, title: task.incident.title },
                    tasks: [],
                };
            }
            acc[incidentId].tasks.push(task);
            return acc;
        }, {} as GroupedTasks);
    }, [tasks]);

    const incidentGroups = Object.values(groupedTasks);

    // --- Render Logic ---

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                 <ListTodo className="h-7 w-7 text-primary" />
                 <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">My Open Tasks</h1>
            </div>
            <p className="text-muted-foreground">Tasks assigned to you that require action (TODO or IN PROGRESS).</p>

            <Separator />

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-6">
                    {[1, 2].map((i) => ( // Render a couple of skeleton groups
                        <Card key={`skel-group-${i}`}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <AlertTriangle className="h-6 w-6 text-destructive"/>
                         <CardTitle className="text-destructive">Error Loading Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive mb-4">{error.message}</p>
                        <Button variant="destructive" size="sm" onClick={() => refetch()}>
                             Retry Loading
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && incidentGroups.length === 0 && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <CardTitle className="text-xl">All Caught Up!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You have no open tasks assigned to you.</p>
                    </CardContent>
                </Card>
            )}

            {/* Task List - Grouped by Incident */}
            {!isLoading && !error && incidentGroups.length > 0 && (
                <div className="space-y-6">
                    {incidentGroups.map(({ incident, tasks: incidentTasks }) => (
                       <Card key={incident.id} className="shadow-sm hover:shadow-md transition-shadow">
                           <CardHeader className="pb-2">
                               {/* Link to the incident detail page */}
                               <Button variant="link" className="p-0 h-auto justify-start" asChild>
                                   <Link href={`/incidents/${incident.id}`}>
                                       <NotebookPen className="mr-2 h-4 w-4 text-muted-foreground" />
                                       <CardTitle className="text-lg hover:underline">{incident.title || 'Untitled Incident'}</CardTitle>
                                   </Link>
                               </Button>
                           </CardHeader>
                           <CardContent className="space-y-2 pt-1">
                               {incidentTasks
                                   .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Ensure consistent order within group
                                   .map(task => (
                                     <TaskListItem key={task.id} task={task} showIncidentLink={false} /> // Don't show link again
                               ))}
                           </CardContent>
                       </Card>
                    ))}
                </div>
            )}
        </div>
    );
}