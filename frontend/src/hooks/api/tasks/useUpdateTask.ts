// frontend/src/hooks/api/tasks/useUpdateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task, TaskStatus } from '@/types';
import { toast } from 'sonner';

interface UpdateTaskPayload {
  incidentId: string;
  taskId: string;
  description?: string;
  status?: TaskStatus;
  // assigneeId handled by useAssignTask
}

const updateTask = async (payload: UpdateTaskPayload): Promise<Task> => {
  const { incidentId, taskId, ...data } = payload;
  const response = await apiClient.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const useUpdateTask = (incidentId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, Omit<UpdateTaskPayload, 'incidentId' | 'taskId'>>({
    mutationFn: (data) => updateTask({ incidentId, taskId, ...data }),
    onSuccess: (updatedTask) => {
      toast.success('Task updated');
      // Update the specific task in the cache
      queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
        return oldData?.map(task => task.id === taskId ? updatedTask : task) ?? [];
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Failed to update task.';
      toast.error(`Error: ${message}`);
      console.error('Error updating task:', error);
    },
  });
};