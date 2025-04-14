import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Incident } from '@/types';
import { CreateIncidentInput } from '@/lib/validations/incident'; // Import Zod type

const createIncident = async (data: CreateIncidentInput): Promise<Incident> => {
  const response = await apiClient.post('/incidents', data);
  return response.data;
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation<Incident, Error, CreateIncidentInput>({ // Specify types
    mutationFn: createIncident,
    onSuccess: (newIncident) => {
      // Invalidate and refetch the incidents list after creation
      queryClient.invalidateQueries({ queryKey: ['incidents'] });

      // Optional: Update cache directly for instant UI update
      // queryClient.setQueryData(['incidents'], (oldData?: Incident[]) => {
      //   return oldData ? [newIncident, ...oldData] : [newIncident];
      // });

      // Optional: Pre-populate cache for the new incident's detail view
      // queryClient.setQueryData(['incident', newIncident.id], newIncident);

      console.log('Incident created successfully:', newIncident);
      // Consider showing a success toast notification here
    },
    onError: (error) => {
      console.error('Error creating incident:', error);
      // Show error toast notification
    },
  });
};