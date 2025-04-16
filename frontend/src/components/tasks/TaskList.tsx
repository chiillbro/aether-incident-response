// frontend/src/components/tasks/TaskList.tsx
import { Task, Role } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskItem } from './TaskItem';
import { CreateTaskForm } from './CreateTaskForm';

interface TaskListProps {
  incidentId: string;
  tasks: Task[];
  isLoading: boolean;
  currentUserRole?: Role; // Pass role for RBAC checks in children
}

export function TaskList({ incidentId, tasks, isLoading, currentUserRole }: TaskListProps) {

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
         <Skeleton className="h-16 w-full" /> {/* Create form placeholder */}
      </div>
    );
  }

  return (
    <div className="space-y-3">
       {tasks.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">No tasks added yet.</p>
       )}
       {tasks.map((task) => (
         <TaskItem
             key={task.id}
             task={task}
             incidentId={incidentId}
             currentUserRole={currentUserRole}
          />
       ))}

        {/* Add Task Form - Conditionally render based on role? */}
        {/* For now, assume ENGINEERs on the team and ADMINs can add tasks */}
       <div className='mt-4 pt-4 border-t'>
            <CreateTaskForm incidentId={incidentId} />
       </div>
    </div>
  );
}