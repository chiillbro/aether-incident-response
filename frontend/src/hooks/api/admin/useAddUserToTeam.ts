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

      // toast(
      //   <div
      //     className={`${t.visible ? 'animate-enter' : 'animate-leave'
      //       } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
      //   >
      //     <div className="p-4">
      //       <div className="flex items-center">
      //         <div className="flex-shrink-0">
      //           <svg
      //             className="h-6 w-6 text-green-400"
      //             xmlns="http://www.w3.org/2000/svg"
      //             fill="none"
      //             viewBox="0 0 24 24"
      //             stroke="currentColor"
      //             aria-hidden="true"
      //           >
      //             <path
      //               strokeLinecap="round"
      //               strokeLinejoin="round"
      //               strokeWidth="2"
      //               d="M5 13l4 4L19 7"
      //             />
      //           </svg>
      //         </div>
      //         <div className="ml-3 w-0 flex-1 pt-0.5">
      //           <p className="text-sm font-medium text-gray-900">
      //             {updatedUser.name} successfully added to the team.
      //           </p>
      //           <p className="mt-1 text-sm text-gray-500">
      //             {updatedUser.email}
      //           </p>
      //         </div>
      //         <div className="ml-4 flex flex-shrink-0">
      //           <button
      //             type="button"
      //             className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      //             onClick={() => t.close()}
      //           >
      //             <span className="sr-only">Close</span>
      //             <svg
      //               className="h-5 w-5"
      //               xmlns="http://www.w3.org/2000/svg"
      //               viewBox="0 0 20 20"
      //               fill="currentColor"
      //               aria-hidden="true"
      //             >
      //               <path
      //                 fillRule="evenodd"
      //                 d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      //                 clipRule="evenodd"
      //               />
      //             </svg>
      //           </button>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // );

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