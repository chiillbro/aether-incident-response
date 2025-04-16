// frontend/src/hooks/api/tasks/useCreateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task } from '@/types';
import { toast } from 'sonner';

interface CreateTaskPayload {
  incidentId: string;
  description: string;
  assigneeId?: string | null;
}

const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const { incidentId, ...data } = payload;
  const response = await apiClient.post(`/incidents/${incidentId}/tasks`, data);
  return response.data;
};

export const useCreateTask = (incidentId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, Omit<CreateTaskPayload, 'incidentId'>>({ // Input omits incidentId
    mutationFn: (data) => createTask({ incidentId, ...data }),
    onSuccess: (newTask) => {
      toast.success('Task created successfully');
      // Update the tasks list cache for this incident
      queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
        return oldData ? [...oldData, newTask] : [newTask];
      });
    },
    onError: (error: any) => {
       const message = error?.response?.data?.message || error.message || 'Failed to create task.';
       toast.error(`Error: ${message}`);
       console.error('Error creating task:', error);
    },
  });
};