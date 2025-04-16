import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Incident } from '@/types';

const fetchIncidentById = async (id: string): Promise<Incident> => {
  const { data } = await apiClient.get(`/incidents/${id}`);
  return data;
};

export const useIncidentById = (id: string | null | undefined) => {
  return useQuery<Incident, Error>({
    queryKey: ['incident', id], // Query key includes the ID
    queryFn: () => fetchIncidentById(id!), // Use non-null assertion or handle null id
    enabled: !!id, // Only run the query if the ID exists
    // Consider adding options like refetchOnMount: false if data is unlikely to change rapidly
  });
};