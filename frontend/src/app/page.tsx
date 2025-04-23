// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// export default function Home() {
//   return (
//    <div className="flex items-center justify-center h-screen font-bold text-2xl text-red-500">
//     <Button>
//       <Link href="/dashboard">
//         Go to Dashboard
//       </Link>
//     </Button>
//    </div>
//   );
// }


// frontend/src/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // For loading indicator

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      // Session is still loading, do nothing yet
      return;
    }

    if (status === 'authenticated') {
      // User is logged in, redirect to the main dashboard
      console.log('RootPage: Authenticated, redirecting to /dashboard');
      router.replace('/dashboard'); // Use replace to avoid back button going here
    } else {
      // User is not logged in, redirect to login page
      console.log('RootPage: Unauthenticated, redirecting to /login');
      router.replace('/login');
    }
  }, [status, router]);

  // Display a loading indicator while checking session status
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3 text-muted-foreground">Loading Aether...</p>
    </div>
  );
}