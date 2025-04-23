// frontend/src/hooks/api/admin/useUpdateUserAdmin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet, Role } from '@/types';
import { toast } from 'sonner';

// DTO matching backend UpdateUserAdminDto
interface UpdateUserAdminInput {
    userId: string;
    role?: Role;
    teamId?: string | null; // Allow null to unassign
}

// Backend returns the updated user snippet
const updateUserAdmin = async ({ userId, ...data }: UpdateUserAdminInput): Promise<UserSnippet> => {
  const response = await apiClient.patch(`/users/${userId}`, data);
  return response.data;
};

export const useUpdateUserAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation<UserSnippet, Error, UpdateUserAdminInput>({
    mutationFn: updateUserAdmin,
    onSuccess: (updatedUser, variables) => {
      // Invalidate the main users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Invalidate specific user query if it exists
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] });
      // Invalidate relevant team member lists if team assignment changed
      queryClient.invalidateQueries({ queryKey: ['admin', 'teamMembers'] }); // Invalidate all team member lists

      toast.success(`User ${updatedUser.name} updated successfully`);
      // toast({
      //   title: 'User Updated',
      //   description: `User ${updatedUser.name} updated successfully.`,
      // });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(error?.response?.data?.message || 'An unknown error occurred.');
      // toast({
      //   variant: 'destructive',
      //   title: 'Update Failed',
      //   description: error?.response?.data?.message || 'Could not update user.',
      // });
    },
  });
};