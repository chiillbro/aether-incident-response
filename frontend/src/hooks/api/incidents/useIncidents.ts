import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios'; // Your configured axios instance
import { Incident } from '@/types'; // Import your Incident type

const fetchIncidents = async (): Promise<Incident[]> => {
  const { data } = await apiClient.get('/incidents');
  return data;
};

export const useIncidents = () => {
  return useQuery<Incident[], Error>({ // Specify types for data and error
    queryKey: ['incidents'], // Unique key for this query
    queryFn: fetchIncidents,
    // Add other options like staleTime if needed
  });
};