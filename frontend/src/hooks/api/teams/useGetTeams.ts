import { useQuery } from '@tanstack/react-query';
import { TeamSnippet } from '@/types';
import apiClient from '@/lib/axios';

const fetchTeams = async (): Promise<TeamSnippet[]> => {
  const response = await apiClient.get('/teams');
  return response.data;
};

export const useGetTeams = () => {
  return useQuery<TeamSnippet[], Error>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
};
