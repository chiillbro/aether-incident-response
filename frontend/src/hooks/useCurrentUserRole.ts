// frontend/src/hooks/useCurrentUserRole.ts
import { useSession } from 'next-auth/react';
import { Role } from '@/types'; // Assuming Role enum is in types

export const useCurrentUserRole = (): Role | undefined => {
  const { data: session } = useSession();
  return session?.user?.role as Role | undefined;
};

// Example Usage in a component:
// import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';
// import { Role } from '@/types';
//
// const MyComponent = () => {
//   const role = useCurrentUserRole();
//
//   if (role === Role.ADMIN) {
//     return <p>Admin Controls</p>;
//   }
//   return <p>Standard View</p>;
// }