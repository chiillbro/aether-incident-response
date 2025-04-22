// // frontend/src/components/auth/SignOutButton.tsx
// 'use client';

// import { signOut } from 'next-auth/react';
// import { useState } from 'react';

// export function SignOutButton() {
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignOut = async () => {
//     setIsLoading(true);
//     await signOut({ callbackUrl: '/login' }); // Redirect to login after sign out
//     // isLoading state might not update if redirect happens immediately
//   };

//   return (
//     <button
//       onClick={handleSignOut}
//       disabled={isLoading}
//       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//     >
//       {isLoading ? 'Signing Out...' : 'Sign Out'}
//     </button>
//   );
// }

// frontend/src/components/auth/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Use shadcn Button
import { LogOut, Loader2 } from 'lucide-react'; // Add Loader icon
import { cn } from '@/lib/utils';

// Add prop to handle collapsed state
interface SignOutButtonProps {
    isCollapsed?: boolean;
}

export function SignOutButton({ isCollapsed = false }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' }); // Redirect to login after sign out
    // isLoading state might not update if redirect happens immediately
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="ghost" // Use ghost variant for sidebar integration
      size={isCollapsed ? "icon" : "sm"} // Adjust size
      className={cn(
          "w-full text-destructive hover:bg-red-100 hover:text-destructive dark:hover:bg-red-900/30",
          isCollapsed ? 'justify-center' : 'justify-start'
      )}
      aria-label="Sign Out"
    >
      {isLoading
        ? <Loader2 className={`h-4 w-4 animate-spin ${isCollapsed ? '' : 'mr-2'}`} />
        : <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
      }
      {!isCollapsed && (isLoading ? 'Signing Out...' : 'Sign Out')}
      {isCollapsed && <span className='sr-only'>Sign Out</span>}
    </Button>
  );
}