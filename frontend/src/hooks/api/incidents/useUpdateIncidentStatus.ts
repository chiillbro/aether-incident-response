// frontend/src/hooks/api/incidents/useUpdateIncidentStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Incident, IncidentStatus } from '@/types';
import { toast } from 'sonner';

interface UpdateStatusPayload {
  incidentId: string;
  status: IncidentStatus;
}

const updateIncidentStatus = async ({ incidentId, status }: UpdateStatusPayload): Promise<Incident> => {
  const response = await apiClient.patch(`/incidents/${incidentId}/status`, { status });
  return response.data;
};

export const useUpdateIncidentStatus = (incidentId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Incident, Error, IncidentStatus>({ // Input is just the new status
    mutationFn: (status) => updateIncidentStatus({ incidentId, status }),
    onSuccess: (updatedIncident) => {
      toast.success(`Incident status updated to ${updatedIncident.status}`);
      // Update the cache for the specific incident
      queryClient.setQueryData(['incident', incidentId], (oldData?: Incident) => {
        return oldData ? { ...oldData, status: updatedIncident.status, updatedAt: updatedIncident.updatedAt } : updatedIncident;
      });
      // Optionally invalidate the main incidents list if status affects its display significantly
      // queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (error: any) => {
       const message = error?.response?.data?.message || error.message || 'Failed to update status.';
       toast.error(`Error: ${message}`);
      console.error('Error updating incident status:', error);
    },
  });
};