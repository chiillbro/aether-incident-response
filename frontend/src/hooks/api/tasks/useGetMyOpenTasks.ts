// frontend/src/hooks/api/tasks/useGetMyOpenTasks.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { Task, TaskStatus } from '@/types'; // Assuming Task type is defined
import { useSession } from 'next-auth/react';

const fetchMyOpenTasks = async (userId: string): Promise<Task[]> => {
  // Fetch tasks assigned to the user that are TODO or IN_PROGRESS
  // Adjust query params based on your backend API design
  const { data } = await apiClient.get('/tasks', {
      params: {
          assigneeId: userId,
          status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS].join(','), // Example: Pass multiple statuses
          limit: 10, // Limit the number fetched for the dashboard
          sortBy: 'createdAt:asc', // Show oldest open tasks first? Or newest?
      }
  });
  return data;
};

export const useGetMyOpenTasks = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery<Task[], Error>({
    // Query key includes the user ID to ensure correct caching per user
    queryKey: ['tasks', 'myOpen', userId],
    queryFn: () => fetchMyOpenTasks(userId!), // Pass user ID
    enabled: !!userId, // Only run if userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};