// frontend/src/hooks/api/admin/useGetTeamMembers.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet } from '@/types'; // Use UserSnippet for non-sensitive list

const fetchTeamMembers = async (teamId: string): Promise<UserSnippet[]> => {
  const { data } = await apiClient.get(`/teams/${teamId}/members`);
  return data;
};

export const useGetTeamMembers = (teamId: string | null | undefined) => {
  return useQuery<UserSnippet[], Error>({
    queryKey: ['admin', 'teamMembers', teamId], // Specific query key for members of this team
    queryFn: () => fetchTeamMembers(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 60, // Cache members for 1 minute
  });
};