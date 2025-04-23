// frontend/src/hooks/api/admin/useDeleteUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet } from '@/types';
import { toast } from 'sonner';

const deleteUser = async (userId: string): Promise<UserSnippet> => {
  // Backend returns the deleted user snippet
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UserSnippet, Error, string>({ // Input is just the userId string
    mutationFn: deleteUser,
    onSuccess: (deletedUser) => {
      // Invalidate the main users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Remove user from specific query caches if they exist
      queryClient.removeQueries({ queryKey: ['admin', 'user', deletedUser.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'teamMembers'] }); // Invalidate all team lists

      toast.success(`User ${deletedUser.name} deleted successfully`);
      // toast({
      //   title: 'User Deleted',
      //   description: `User ${deletedUser.name} deleted successfully.`,
      // });
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(error?.response?.data?.message || 'Could not delete user.');
      // toast({
      //   variant: 'destructive',
      //   title: 'Deletion Failed',
      //   description: error?.response?.data?.message || 'Could not delete user.',
      // });
    },
  });
};