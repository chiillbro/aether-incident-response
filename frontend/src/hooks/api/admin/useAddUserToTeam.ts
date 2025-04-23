// frontend/src/hooks/api/admin/useAddUserToTeam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet as User } from '@/types'; // Assuming User type includes teamId
import { toast } from 'sonner';

// Input type matches the backend DTO (just userId)
interface AddUserToTeamInput {
  teamId: string;
  userId: string;
}

const addUserToTeam = async ({ teamId, userId }: AddUserToTeamInput): Promise<User> => {
  // Backend expects userId in the body for POST /teams/:id/users
  const response = await apiClient.post(`/teams/${teamId}/users`, { userId });
  return response.data;
};

export const useAddUserToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, AddUserToTeamInput>({
    mutationFn: addUserToTeam,
    onSuccess: (updatedUser, variables) => {
      const { teamId } = variables;
      // Invalidate queries related to this specific team's members
      queryClient.invalidateQueries({ queryKey: ['admin', 'teamMembers', teamId] });
      // Optionally invalidate the list of all users if their team assignment is shown there
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      // toast({
      //   title: 'User Added',
      //   description: `${updatedUser.name} successfully added to the team.`,
      // });

      toast.success(`${updatedUser.name} successfully added to the team.`)


    },
    onError: (error: any) => {
      console.error('Error adding user to team:', error);
      toast.error(error?.response?.data?.message || 'An unknown error occurred.');
      // toast({
      //   variant: 'destructive',
      //   title: 'Failed to Add User',
      //   description: error.message || 'An unknown error occurred.',
      // });
    },
  });
};