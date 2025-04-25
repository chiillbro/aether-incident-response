
// frontend/src/app/(main)/layout.tsx
'use client'; // Needs client state for sidebar

import { useState, ReactNode, useEffect } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'; // Import sidebar
// We still need Role check here if AdminLayout wasn't used, or for shared logic
import { useSession } from 'next-auth/react';
import { Role } from '@/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import if redirecting from here
import { MobileActionHub } from '@/components/layout/MobileActionHub';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { useSocketStore } from '@/store/socketStore';
// import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

// Optional: Header component if needed
// import DashboardHeader from '@/components/layout/DashboardHeader';

export default function MainAppLayout({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar state
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter(); // If redirecting here


     // --- Get actions from Socket Store ---
     const connectSocket = useSocketStore((state) => state.connect);
     const disconnectSocket = useSocketStore((state) => state.disconnect);
     const socket = useSocketStore((state) => state.socket);
     // -------------------------------------


     // --- Connect/Disconnect Socket based on Session Status ---
    useEffect(() => {
        if (sessionStatus === 'authenticated' && session?.accessToken && session?.user && !socket?.connected) {
          console.log("Layout Effect: Session authenticated, connecting socket...");
          connectSocket(session.accessToken, session.user);
        } else if (sessionStatus === 'unauthenticated' && socket?.connected) {
          console.log("Layout Effect: Session unauthenticated, disconnecting socket...");
          disconnectSocket();
        }
  
        // Cleanup on component unmount (e.g., full page reload/close)
        return () => {
          // Only disconnect if navigating away completely, not just re-renders
          // The disconnect logic might be better handled solely based on session status change
          // console.log("Layout Effect Cleanup: Disconnecting socket...");
          // disconnectSocket(); // Potential issue: disconnects on every navigation?
        };
        // Rerun when session status or user details change
      }, [sessionStatus, session?.accessToken, session?.user, connectSocket, disconnectSocket, socket]);
      // ------------------------------------------------------
  

    // --- Run the global notification listener hook ---
    // useGlobalNotifications();
    // -------------------------------------------------

    // Optional: You could handle the Auth check here instead of AdminLayout
    // Or keep AdminLayout specifically for /admin routes
    // Example check if NOT using separate AdminLayout:
    // useEffect(() => {
    //   if (status === 'unauthenticated') router.replace('/login');
    // }, [status, router]);
    // if (status === 'loading') { /* return loading spinner */ }
    // if (status === 'unauthenticated') return null; // Or redirect

    // --- Auth Protection for ALL routes under (main) ---
    useEffect(() => {
        if (sessionStatus === 'loading') return; // Wait
  
        if (sessionStatus === 'unauthenticated') {
          console.log('MainAppLayout: Unauthenticated, redirecting to login.');
          // Redirect to login, passing the intended destination
          const currentPath = window.location.pathname + window.location.search;
          router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
        }
      }, [sessionStatus, router]);
  
      // Show loading state for the entire main layout while auth check happens
      if (sessionStatus === 'loading' || sessionStatus === 'unauthenticated') {
           return (
               <div className="flex items-center justify-center h-screen w-screen bg-background">
                   <Loader2 className="h-10 w-10 animate-spin text-primary" />
                   {sessionStatus === 'loading' && <p className="ml-3 text-muted-foreground">Authenticating...</p>}
               </div>
           );
      }
      // ----------------------------------------------------
  
      // Render layout only if authenticated

    return (
        // --- Flex container for the full viewport height ---
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden"> {/* Added overflow-hidden to parent */}

            {/* --- Sidebar Component --- */}
            {/* It has a fixed width (w-16 or w-60) and takes full height */}
            <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* --- Main Content Area --- */}
            {/* flex-1 makes it take remaining width. flex-col allows header/main stacking. overflow-hidden prevents weird scrollbars */}
            {/* <div className="flex flex-1 flex-col overflow-hidden"> */}

                {/* Optional Header would go here */}
                {/* <header className="h-16 border-b shrink-0">...</header> */}

                {/* Page Content */}
                {/* flex-1 makes it take remaining height. overflow-y-auto enables scrolling *within* the main area ONLY */}
                {/* <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 bg-muted/40 dark:bg-muted/10">
                    {children}
                </main>
            </div> */}

            {/* --- Main Content Area --- */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* --- Mobile Header (Shown only on Mobile) --- */}
                <MobileHeader />

                {/* Page Content */}
                {/* Adjust padding: Add padding-top for header, padding-bottom for FAB */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20 md:pt-6 md:pb-8 md:px-8 bg-muted/40 dark:bg-muted/10"> {/* Adjusted padding */}
                    {children}
                </main>

                {/* --- Mobile Action Hub (Shown only on Mobile) --- */}
                <MobileActionHub />
            </div>
        </div>
    );
}