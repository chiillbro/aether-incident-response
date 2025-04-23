// frontend/src/components/tasks/TaskListItem.tsx
import Link from 'next/link';
import { Task, TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, CircleDotDashed, LinkIcon, UserCircle } from 'lucide-react';

interface TaskListItemProps {
  task: Task;
  showIncidentLink?: boolean; // Option to show link back to incident
}

// Helper for status badge styling
const getTaskStatusVariant = (status: TaskStatus): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case TaskStatus.TODO: return 'secondary';
        case TaskStatus.IN_PROGRESS: return 'default'; // Use primary color for active work
        case TaskStatus.DONE: return 'outline'; // More subtle for completed
        default: return 'secondary';
    }
};
const getTaskStatusIcon = (status: TaskStatus) => {
     switch (status) {
        case TaskStatus.TODO: return <CircleDotDashed className="h-3 w-3" />;
        case TaskStatus.IN_PROGRESS: return <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>; // Ping animation
        case TaskStatus.DONE: return <CheckCircle2 className="h-3 w-3 text-green-600" />;
        default: return <CircleDotDashed className="h-3 w-3" />;
    }
}


export function TaskListItem({ task, showIncidentLink = true }: TaskListItemProps) {

  return (
    <div className="flex items-start justify-between gap-4 p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-sm font-medium leading-none truncate" title={task.description}>
          {task.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
           <Badge variant={getTaskStatusVariant(task.status)} className="px-1.5 py-0 h-5">
               <span className='mr-1'>{getTaskStatusIcon(task.status)}</span> {task.status}
           </Badge>
           <span>•</span>
           <span>Opened {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
           {showIncidentLink && task.incident && (
               <>
                 <span>•</span>
                 <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" asChild>
                     <Link href={`/incidents/${task.incident.id}`} title={task.incident.title}>
                        <LinkIcon className='mr-1 h-3 w-3'/>
                         Incident: <span className='ml-1 font-medium truncate max-w-[150px]'>{task.incident.title}</span>
                     </Link>
                 </Button>
               </>
           )}
        </div>
      </div>
      <div className="flex-shrink-0">
        {task.assignee ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Ideally use Avatar component here */}
                 <span className='flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-semibold border'>
                     {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                 </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assigned to: {task.assignee.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                <TooltipTrigger asChild>
                     <span className='flex items-center justify-center h-7 w-7 rounded-full bg-muted text-muted-foreground border border-dashed'>
                         <UserCircle className='h-4 w-4'/>
                     </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Unassigned</p>
                </TooltipContent>
                </Tooltip>
             </TooltipProvider>
        )}
      </div>
      {/* Optional: Add Action Button/Dropdown to change status directly from list */}
      {/* <Button variant="outline" size="sm">Actions</Button> */}
    </div>
  );
}