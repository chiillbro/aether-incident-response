// frontend/src/components/tasks/CreateTaskForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTask } from '@/hooks/api/tasks/useCreateTask';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const createTaskSchema = z.object({
  description: z.string().min(3, { message: 'Task description must be at least 3 characters' }).max(500),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

interface CreateTaskFormProps {
  incidentId: string;
}

export function CreateTaskForm({ incidentId }: CreateTaskFormProps) {
  const { mutate: createTask, isPending } = useCreateTask(incidentId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { description: '' },
  });

  const onSubmit = (data: CreateTaskInput) => {
    createTask(data, {
      onSuccess: () => {
        reset(); // Reset form on successful creation
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
      <div className="flex-grow">
        <Input
          id={`new-task-${incidentId}`}
          placeholder="Add a new task..."
          {...register('description')}
          disabled={isPending}
          className={cn("h-9", errors.description && "border-red-500")}
           aria-invalid={errors.description ? "true" : "false"}
        />
        {errors.description && <p role="alert" className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>
      <Button
        type="submit"
        size="sm"
        className="h-9 px-3"
        disabled={isPending}
        aria-label="Add task"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
         <span className='ml-1 hidden sm:inline'>Add Task</span>
      </Button>
    </form>
  );
}