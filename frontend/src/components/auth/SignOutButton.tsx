// frontend/src/components/auth/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' }); // Redirect to login after sign out
    // isLoading state might not update if redirect happens immediately
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
}