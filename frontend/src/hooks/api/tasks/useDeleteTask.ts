// frontend/src/hooks/api/tasks/useDeleteTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task } from '@/types';
import { toast } from 'sonner';

interface DeleteTaskPayload {
  incidentId: string;
  taskId: string;
}

const deleteTask = async ({ incidentId, taskId }: DeleteTaskPayload): Promise<Task> => {
  // Backend returns the deleted task, but we mostly care about the ID for cache update
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data; // Assuming backend returns deleted task
};

export const useDeleteTask = (incidentId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: string }>({
    mutationFn: ({ taskId }) => deleteTask({ incidentId, taskId }),
    onSuccess: (deletedTask, variables) => {
      toast.success('Task deleted');
      // Remove the task from the cache
      queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
        return oldData?.filter(task => task.id !== variables.taskId) ?? [];
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Failed to delete task.';
      toast.error(`Error: ${message}`);
      console.error('Error deleting task:', error);
    },
  });
};