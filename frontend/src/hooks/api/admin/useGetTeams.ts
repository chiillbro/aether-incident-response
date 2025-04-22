// frontend/src/hooks/api/admin/useGetTeams.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { TeamSnippet as Team } from '@/types'; // Assuming you define Team type based on Prisma

const fetchTeams = async (): Promise<Team[]> => {
  const { data } = await apiClient.get('/teams'); // Ensure backend API endpoint is /teams
  return data;
};

export const useGetTeams = () => {
  return useQuery<Team[], Error>({
    queryKey: ['admin', 'teams'], // Use specific admin query key
    queryFn: fetchTeams,
  });
};