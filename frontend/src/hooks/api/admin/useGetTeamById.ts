// frontend/src/hooks/api/admin/useGetTeamById.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { TeamSnippet as Team } from '@/types';

const fetchTeamById = async (teamId: string): Promise<Team> => {
  const { data } = await apiClient.get(`/teams/${teamId}`);
  return data;
};

export const useGetTeamById = (teamId: string | null | undefined) => {
  return useQuery<Team, Error>({
    queryKey: ['admin', 'team', teamId], // Query key includes the team ID
    queryFn: () => fetchTeamById(teamId!), // Use non-null assertion or handle null id
    enabled: !!teamId, // Only run the query if the team ID exists
    staleTime: 1000 * 60 * 5, // Cache team details for 5 mins
  });
};