
// frontend/src/app/(main)/layout.tsx
'use client'; // Needs client state for sidebar

import { useState, ReactNode } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'; // Import sidebar
// We still need Role check here if AdminLayout wasn't used, or for shared logic
import { useSession } from 'next-auth/react';
import { Role } from '@/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import if redirecting from here

// Optional: Header component if needed
// import DashboardHeader from '@/components/layout/DashboardHeader';

export default function MainAppLayout({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar state
    const { data: session, status } = useSession();
    const router = useRouter(); // If redirecting here

    // Optional: You could handle the Auth check here instead of AdminLayout
    // Or keep AdminLayout specifically for /admin routes
    // Example check if NOT using separate AdminLayout:
    // useEffect(() => {
    //   if (status === 'unauthenticated') router.replace('/login');
    // }, [status, router]);
    // if (status === 'loading') { /* return loading spinner */ }
    // if (status === 'unauthenticated') return null; // Or redirect

    return (
        // --- Flex container for the full viewport height ---
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden"> {/* Added overflow-hidden to parent */}

            {/* --- Sidebar Component --- */}
            {/* It has a fixed width (w-16 or w-60) and takes full height */}
            <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* --- Main Content Area --- */}
            {/* flex-1 makes it take remaining width. flex-col allows header/main stacking. overflow-hidden prevents weird scrollbars */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Optional Header would go here */}
                {/* <header className="h-16 border-b shrink-0">...</header> */}

                {/* Page Content */}
                {/* flex-1 makes it take remaining height. overflow-y-auto enables scrolling *within* the main area ONLY */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 bg-muted/40 dark:bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}