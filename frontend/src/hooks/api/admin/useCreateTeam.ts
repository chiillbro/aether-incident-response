// frontend/src/hooks/api/admin/useCreateTeam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { TeamSnippet as Team } from '@/types';
import { z } from 'zod';

const createTeamSchema = z.object({ name: z.string().min(2).max(100) });
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

const createTeam = async (data: CreateTeamInput): Promise<Team> => {
  const response = await apiClient.post('/teams', data);
  return response.data;
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, CreateTeamInput>({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
};