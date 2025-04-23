// frontend/src/hooks/api/tasks/useGetTasksByIncident.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task } from '@/types';

const fetchTasksByIncident = async (incidentId: string): Promise<Task[]> => {
  const response = await apiClient.get(`/tasks/${incidentId}`);
  return response.data;
};

export const useGetTasksByIncident = (incidentId: string | null | undefined) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', incidentId], // Include incidentId in the query key
    queryFn: () => fetchTasksByIncident(incidentId!), // Use ! because enabled ensures it's defined
    enabled: !!incidentId, // Only run the query if incidentId is truthy
    staleTime: 1000 * 60 * 2, // Consider tasks data slightly less stable than incidents list (2 mins)
  });
};