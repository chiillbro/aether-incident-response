// frontend/src/components/tasks/TaskItem.tsx
import { Task, TaskStatus, Role, UserSnippet } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUpdateTask } from '@/hooks/api/tasks/useUpdateTask';
import { useDeleteTask } from '@/hooks/api/tasks/useDeleteTask';
import { useAssignTask } from '@/hooks/api/tasks/useAssignTask';
import { Trash2, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming you have Avatar
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Assuming Tooltip
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog" // Confirmation Dialog
import { useUsers } from '@/hooks/api/users/useUsers';


interface TaskItemProps {
  task: Task;
  incidentId: string;
  currentUserRole?: Role;
}

// Helper to get initials from name
const getInitials = (name?: string | null) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .filter((_, i, arr) => i === 0 || i === arr.length - 1) // First and Last initial
      .join('')
      .toUpperCase() || '?';
}


export function TaskItem({ task, incidentId, currentUserRole }: TaskItemProps) {
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(incidentId, task.id);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(incidentId);
  const { mutate: assignTask, isPending: isAssigning } = useAssignTask(incidentId, task.id);

  // Fetch users for assignment dropdown
  const { data: users, isLoading: isLoadingUsers } = useUsers(); // Assumes useUsers hook exists

  const handleStatusChange = (newStatus: string) => {
     if (Object.values(TaskStatus).includes(newStatus as TaskStatus)) {
        updateTask({ status: newStatus as TaskStatus });
     }
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
      assignTask({ assigneeId: newAssigneeId === 'unassigned' ? null : newAssigneeId });
  }

  const handleDelete = () => {
     deleteTask({ taskId: task.id });
  };

  const canModifyTask = currentUserRole === Role.ADMIN // Admins can do anything
                          // || current user is assigned // Assignees can update status?
                          // || user is on the incident team? // Requires passing teamId or fetching incident here
                          ; // Define your RBAC rules here

  const canDeleteTask = currentUserRole === Role.ADMIN; // Example: Only Admins delete

  console.log("currentUserRole", currentUserRole)

  return (
    <Card className={cn("transition-opacity", (isUpdating || isDeleting || isAssigning) && "opacity-70")}>
      <CardContent className="p-3 flex items-start gap-3">
         {/* Status Checkbox/Indicator */}
         <div className='pt-1'>
             {/* Simplistic: Checkbox for DONE state */}
             <Checkbox
                id={`task-status-${task.id}`}
                checked={task.status === TaskStatus.DONE}
                onCheckedChange={(checked) => handleStatusChange(checked ? TaskStatus.DONE : TaskStatus.TODO)} // Toggle between TODO/DONE
                disabled={isUpdating || !canModifyTask}
                aria-label={`Mark task ${task.status === TaskStatus.DONE ? 'incomplete' : 'complete'}`}
             />
            {/* Alternative: Use the Select below for all statuses */}
         </div>

         {/* Task Description & Meta */}
         <div className="flex-grow space-y-1">
           <label
             htmlFor={`task-status-${task.id}`} // Associate label with checkbox
             className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                task.status === TaskStatus.DONE && "line-through text-muted-foreground"
             )}
            >
              {task.description}
           </label>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                 <Select
                    value={task.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating || !canModifyTask}
                 >
                    <SelectTrigger className="h-6 px-2 py-0 text-xs w-[110px] focus:ring-0 border-none shadow-none bg-transparent hover:bg-accent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(TaskStatus).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span>·</span>
                 <span>Added {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
            </div>

         </div>

         {/* Assignee & Actions */}
         <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* Assignee Selector */}
            <TooltipProvider delayDuration={100}>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Select
                             value={task.assigneeId ?? 'unassigned'}
                             onValueChange={handleAssigneeChange}
                             disabled={isAssigning || isLoadingUsers || !canModifyTask}
                         >
                            <SelectTrigger
                                className={cn(
                                    "h-7 w-7 p-0 rounded-full focus:ring-0 border-none shadow-none bg-transparent hover:bg-accent",
                                    task.assignee ? "ring-1 ring-offset-1 ring-primary" : ""
                                 )}
                                 aria-label='Assign task user'
                                >
                                 <SelectValue asChild>
                                    <Avatar className="h-6 w-6">
                                        {task.assignee?.name && (
                                           <AvatarFallback className='text-xs bg-secondary'>
                                               {getInitials(task.assignee.name)}
                                           </AvatarFallback>
                                        )}
                                        {!task.assignee && (
                                             <AvatarFallback className='text-xs bg-muted hover:bg-accent'>
                                                <UserPlus className='h-3 w-3'/>
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                 </SelectValue>
                             </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                                {users?.map(user => (
                                    <SelectItem key={user.id} value={user.id} className="text-xs">
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                                {isLoadingUsers && <SelectItem value="loading" disabled className='text-xs'>Loading users...</SelectItem>}
                            </SelectContent>
                         </Select>
                     </TooltipTrigger>
                     <TooltipContent side='bottom'>
                         {task.assignee ? `Assigned to ${task.assignee.name}` : 'Assign user'}
                    </TooltipContent>
                 </Tooltip>
            </TooltipProvider>


             {/* Delete Button */}
             {canDeleteTask && (
                 <AlertDialog>
                     <TooltipProvider delayDuration={100}>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                 <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        disabled={isDeleting || isUpdating || isAssigning}
                                        aria-label="Delete task"
                                    >
                                         {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                             <TooltipContent side='bottom'>Delete Task</TooltipContent>
                         </Tooltip>
                    </TooltipProvider>
                    <AlertDialogContent>
                         <AlertDialogHeader>
                         <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                         <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete the task: "{task.description}".
                         </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                         <AlertDialogAction onClick={handleDelete} className='bg-destructive hover:bg-destructive/90'>
                             Delete
                         </AlertDialogAction>
                         </AlertDialogFooter>
                     </AlertDialogContent>
                </AlertDialog>
             )}
         </div>

      </CardContent>
    </Card>
  );
}