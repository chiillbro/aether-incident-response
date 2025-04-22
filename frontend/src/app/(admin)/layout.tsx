// frontend/src/app/(admin)/layout.tsx
'use client'; // Needs client hooks for session/redirect

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Role } from '@/types'; // Import your Role enum/type
import { Loader2, ShieldAlert } from 'lucide-react';

// Optional: Simple Admin Sidebar/Header component
// import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admins or unauthenticated users away
    if (status === 'loading') return; // Wait for session to load

    if (status === 'unauthenticated') {
      console.log('AdminLayout: Unauthenticated, redirecting to login.');
      router.replace('/login?callbackUrl=/admin'); // Redirect to login
      return;
    }

    // Check for ADMIN role after authentication
    if (session?.user?.role !== Role.ADMIN) {
      console.log(`AdminLayout: User is not ADMIN (Role: ${session?.user?.role}), redirecting to dashboard.`);
      router.replace('/dashboard'); // Redirect non-admins
    }
  }, [session, status, router]);

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading Admin Area...</p>
      </div>
    );
  }

  // Show access denied if session loaded but user is not ADMIN (should be caught by redirect, but good fallback)
  if (session?.user?.role !== Role.ADMIN) {
     return (
         <div className="flex flex-col items-center justify-center h-screen text-red-600">
            <ShieldAlert className="h-12 w-12 mb-4"/>
            <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
            <p>You do not have permission to access this area.</p>
         </div>
     );
  }

  // Render children if user is authenticated and is an ADMIN
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
       {/* Optional Sidebar */}
       {/* <AdminSidebar /> */}
       <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
       </main>
    </div>
  );
}