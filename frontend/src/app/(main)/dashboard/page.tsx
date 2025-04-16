// // frontend/src/app/(main)/dashboard/page.tsx
// import { getServerSession } from 'next-auth/next'; // Import from /next for server components
// import { authOptions } from '@/lib/auth';
// import { SignOutButton } from '@/components/auth/SignOutButton';

// export default async function DashboardPage() {
//   // Fetch session on the server side for server components
//   const session = await getServerSession(authOptions);

//   // Middleware should protect this page, but we can double-check
//   if (!session) {
//      // This usually won't be reached due to middleware, but good practice
//      // Or you could redirect here, but middleware handles it cleaner
//      return <p>Access Denied. Please log in.</p>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Aether Dashboard</h1>
//       <p className="mb-2">Welcome, {session.user?.name ?? 'User'}!</p>
//       <p className="mb-2">Your Email: {session.user?.email}</p>
//       <p className="mb-4">Your Role: {session.user?.role}</p>
//       {/* Add Dashboard content here */}

//       <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs my-4">
//         {JSON.stringify(session, null, 2)}
//       </pre>

//       <SignOutButton />
//     </div>
//   );
// }

// frontend/src/app/(main)/dashboard/page.tsx
'use client'; // Mark as Client Component because we use hooks

import { useState } from 'react';
import { useIncidents } from '@/hooks/api/incidents/useIncidents';
import { IncidentList } from '@/components/incidents/IncidentList';
import { Button } from '@/components/ui/button';
import { CreateIncidentDialog } from '@/components/incidents/CreateIncidentDialog';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { data: incidents, isLoading, error, refetch } = useIncidents();

  console.log("data", incidents)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleIncidentCreated = () => {
    setIsCreateDialogOpen(false);
    refetch(); // Refetch the list after creation (alternative to cache invalidation)
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Incident Dashboard</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Declare New Incident</Button>
      </div>

      {isLoading && ( // Show loading skeletons
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {error && ( // Show error message
        <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
           <AlertTriangle className="h-5 w-5"/>
           <span>Error loading incidents: {error.message}</span>
           <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {!isLoading && !error && incidents && (
         <IncidentList incidents={incidents} />
      )}

      {!isLoading && !error && (!incidents || incidents.length === 0) && (
         <p className="text-center text-gray-500 mt-8">No incidents found.</p>
      )}

      <CreateIncidentDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
}