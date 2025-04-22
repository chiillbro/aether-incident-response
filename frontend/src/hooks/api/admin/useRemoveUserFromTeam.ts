// frontend/src/hooks/api/admin/useRemoveUserFromTeam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet as User } from '@/types';
import { toast } from 'sonner';

interface RemoveUserFromTeamInput {
  teamId: string;
  userId: string;
}

// Returns the user object *after* teamId is set to null by backend
const removeUserFromTeam = async ({ teamId, userId }: RemoveUserFromTeamInput): Promise<User> => {
  const response = await apiClient.delete(`/teams/${teamId}/users/${userId}`);
  return response.data;
};

export const useRemoveUserFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, RemoveUserFromTeamInput>({
    mutationFn: removeUserFromTeam,
    onSuccess: (updatedUser, variables) => {
      const { teamId } = variables;
      // Invalidate team members list
      queryClient.invalidateQueries({ queryKey: ['admin', 'teamMembers', teamId] });
      // Optionally invalidate the list of all users
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      // toast({
      //   title: 'User Removed',
      //   description: `${updatedUser.name} successfully removed from the team.`,
      // });

      toast.success(`${updatedUser.name} successfully removed from the team.`);
    },
    onError: (error) => {
      console.error('Error removing user from team:', error);
      toast.error(error.message || 'An unknown error occurred.');
      // toast({
      //   variant: 'destructive',
      //   title: 'Failed to Remove User',
      //   description: error.message || 'An unknown error occurred.',
      // });
    },
  });
};