// // frontend/src/hooks/api/admin/useGetUsers.ts
// import { useQuery } from '@tanstack/react-query';
// import apiClient from '@/lib/axios';
// import { UserSnippet } from '@/types'; // Use a snippet type

// // TODO: Add pagination/search parameters if needed
// const fetchUsers = async (): Promise<UserSnippet[]> => {
//   const { data } = await apiClient.get('/users'); // Needs GET /users endpoint
//   return data;
// };

// export const useGetUsers = () => {
//   return useQuery<UserSnippet[], Error>({
//     queryKey: ['admin', 'users'],
//     queryFn: fetchUsers,
//     staleTime: 1000 * 60 * 10, // Cache users longer
//   });
// };

// frontend/src/hooks/api/admin/useGetUsers.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserSnippet } from '@/types'; // Use the snippet type

const fetchUsers = async (): Promise<UserSnippet[]> => {
  // Assuming the backend UsersService.findAllLite returns the correct UserSnippet shape
  const { data } = await apiClient.get('/users'); // Target the new GET /users endpoint
  return data;
};

export const useGetUsers = () => {
  return useQuery<UserSnippet[], Error>({
    queryKey: ['admin', 'users'], // Query key for caching
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 15, // Cache user list for 15 minutes
    refetchOnWindowFocus: false,
  });
};