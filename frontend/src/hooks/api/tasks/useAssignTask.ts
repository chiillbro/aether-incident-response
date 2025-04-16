// frontend/src/hooks/api/tasks/useAssignTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task, UserSnippet } from '@/types';
import { toast } from 'sonner';

interface AssignTaskPayload {
  incidentId: string;
  taskId: string;
  assigneeId?: string | null; // Send null to unassign
}

const assignTask = async (payload: AssignTaskPayload): Promise<Task> => {
  const { incidentId, taskId, assigneeId } = payload;
  const response = await apiClient.patch(`/incidents/${incidentId}/tasks/${taskId}/assign`, { assigneeId });
  return response.data; // Should include updated assignee info
};

export const useAssignTask = (incidentId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { assigneeId?: string | null }>({
    mutationFn: (data) => assignTask({ incidentId, taskId, ...data }),
    onSuccess: (updatedTask, variables) => {
        const action = variables.assigneeId ? 'assigned' : 'unassigned';
        const assigneeName = updatedTask.assignee?.name ?? 'nobody'; // Assuming backend returns assignee
        toast.success(`Task ${action} to ${assigneeName}`);

        // Update the specific task in the cache
        queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
            return oldData?.map(task => task.id === taskId ? updatedTask : task) ?? [];
        });
    },
    onError: (error: any) => {
        const message = error?.response?.data?.message || error.message || 'Failed to assign task.';
        toast.error(`Error: ${message}`);
        console.error('Error assigning task:', error);
    },
  });
};