import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios'; // Your configured axios instance
import { UserSnippet } from '@/types'; // Import your Incident type

const fetchUsers = async (): Promise<UserSnippet[]> => {
  const { data } = await apiClient.get('/users');
  return data;
};

export const useUsers = () => {
  return useQuery<UserSnippet[], Error>({ // Specify types for data and error
    queryKey: ['users'], // Unique key for this query
    queryFn: fetchUsers,
    // Add other options like staleTime if needed
  });
};