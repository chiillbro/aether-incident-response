// // frontend/src/app/(main)/incidents/[id]/page.tsx
// 'use client';

// import { useParams } from 'next/navigation';
// import { useIncidentById } from '@/hooks/api/incidents/useIncidentById';
// import { useIncidentChannel } from '@/hooks/useIncidentChannel';
// import { IncidentDetails } from '@/components/incidents/IncidentDetails';
// // import { IncidentChat } from '@/components/incidents/chat/IncidentChat';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AlertTriangle } from 'lucide-react';
// import { useSocketStore } from '@/store/socketStore';
// import { Badge } from '@/components/ui/badge';
// import { useEffect, useState } from 'react';
// import { Message } from '@/types';
// import { IncidentChat } from '@/components/chat/IncidentChat';
// import { Button } from '@/components/ui/button';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useUsers } from '@/hooks/api/users/useUsers';


// export default function IncidentDetailPage() {
//   const params = useParams();
//   const id = typeof params.id === 'string' ? params.id : null; // Get ID from route
//   const { status: socketStatus, error: socketError } = useSocketStore(); // Get WS status

//   // Fetch incident details
//   const { data: incident, isLoading: isLoadingIncident, error: incidentError, refetch } = useIncidentById(id);

//   const { data: users } = useUsers();

//   // const queryClient = useQueryClient();
//   // const messagesFromCache = queryClient.getQueryData<Message[]>(['messages', id])
//   // console.log("messagesFromCache", messagesFromCache)

//    // WebSocket Hook state management moved inside
//   const [messages, setMessages] = useState<Message[]>([]);
//   const { messages: wsMessages, sendMessage, typingUsers, handleTyping } = useIncidentChannel(id); // Pass setMessages

//   // Update local messages when WebSocket hook's messages change
//   useEffect(() => {
//      setMessages(wsMessages);
//   }, [wsMessages]);


//   // Display loading state
//   if (isLoadingIncident) {
//     return (
//       <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
//          <Skeleton className="h-10 w-3/4" />
//          <Skeleton className="h-6 w-1/4" />
//          <div className="flex gap-4">
//             <Skeleton className="h-8 w-24" />
//             <Skeleton className="h-8 w-24" />
//          </div>
//          <Skeleton className="h-64 w-full" />
//       </div>
//     );
//   }

//   // Display error state
//   if (incidentError || !incident) {
//     return (
//        <div className="container mx-auto p-4 md:p-6 lg:p-8">
//           <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
//              <AlertTriangle className="h-5 w-5"/>
//              <span>
//                  {incidentError ? `Error loading incident: ${incidentError.message}` : 'Incident not found.'}
//              </span>
//              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
//           </div>
//        </div>
//     );
//   }

//   // Display WebSocket status/error
//    const renderSocketStatus = () => {
//      if (socketStatus === 'connecting') return <Badge variant="outline">Chat Connecting...</Badge>;
//      if (socketStatus === 'error') return <Badge variant="destructive">Chat Error: {socketError || 'Failed'}</Badge>;
//      if (socketStatus === 'disconnected') return <Badge variant="secondary">Chat Disconnected</Badge>;
//      // Implicitly connected if none of the above
//      // return <Badge className="bg-green-500">Chat Connected</Badge>;
//      return null; // Don't show anything if connected
//    };


//   // Display incident details and chat
//   return (
//     <div className="container mx-auto p-4 md:p-6 lg:p-8">
//       <div className="flex justify-between items-start mb-4">
//         <IncidentDetails incident={incident} />
//         <div className="flex-shrink-0"> {renderSocketStatus()}</div>
//       </div>
//       <IncidentChat
//         users={users || []}
//         typingUsers={typingUsers}
//         onTyping={handleTyping}
//          messages={messages}
//          onSendMessage={sendMessage}
//          incidentId={incident.id}
//          isLoading={socketStatus === 'connecting'} // Pass loading state
//       />
//     </div>
//   );
// }

// frontend/src/app/(main)/incidents/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useIncidentById } from '@/hooks/api/incidents/useIncidentById'; // Adjusted path
import { useIncidentChannel } from '@/hooks/useIncidentChannel';
import { IncidentDetails } from '@/components/incidents/IncidentDetails';
import { IncidentChat } from '@/components/chat/IncidentChat';
import { UpdateStatusControl } from '@/components/incidents/UpdateStatusControl'; // Import Status Control
import { TaskList } from '@/components/tasks/TaskList'; // Import Task List
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, AlertTriangle, WifiOff } from 'lucide-react'; // Updated icons
import { useSocketStore } from '@/store/socketStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetTasksByIncident } from '@/hooks/api/tasks/useGetTasksByIncident'; // Import task hook
import { useSession } from 'next-auth/react'; // Import useSession for role checks
import { Role } from '@/types'; // Import Role enum

export default function IncidentDetailPage() {
  const params = useParams();
  const { data: session } = useSession(); // Get session for role checks
  const currentUserRole = session?.user?.role as Role | undefined;
  const currentUserId = session?.user?.id;

  const id = typeof params.id === 'string' ? params.id : null; // Get ID from route
  const { status: socketStatus, error: socketError } = useSocketStore();

  // Fetch incident details - React Query handles caching and updates from WS hook
  const {
      data: incident,
      isLoading: isLoadingIncident,
      error: incidentError,
      refetch: refetchIncident
  } = useIncidentById(id);

  // Fetch tasks for this incident - React Query handles caching and updates from WS hook
  const {
      data: tasks,
      isLoading: isLoadingTasks,
      error: tasksError,
      refetch: refetchTasks
  } = useGetTasksByIncident(id);

  // WebSocket Hook for chat messages and typing indicators
  const { messages, sendMessage, emitTyping, typingUsers } = useIncidentChannel(id);

  // --- Loading State ---
  if (isLoadingIncident) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-pulse">
         <Skeleton className="h-10 w-3/4" />
         <Skeleton className="h-6 w-1/4" />
         <div className="flex gap-4"> <Skeleton className="h-8 w-24" /> <Skeleton className="h-8 w-24" /> </div>
         <Skeleton className="h-10 w-48" /> {/* Placeholder for status control */}
         <Skeleton className="h-8 w-32" /> {/* Placeholder for tasks header */}
         <Skeleton className="h-40 w-full" /> {/* Placeholder for tasks list */}
         <Skeleton className="h-8 w-32" /> {/* Placeholder for chat header */}
         <Skeleton className="h-64 w-full" /> {/* Placeholder for chat */}
      </div>
    );
  }

  // --- Error State ---
  if (incidentError || !incident) {
    return (
       <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-3">
             <AlertTriangle className="h-6 w-6 flex-shrink-0"/>
             <div className='flex-grow'>
                 <p className='font-semibold'>Error Loading Incident</p>
                 <p className='text-sm'>
                    {incidentError?.message || 'The requested incident could not be found.'}
                 </p>
             </div>
             <Button variant="outline" size="sm" onClick={() => refetchIncident()} className="ml-auto">Retry</Button>
          </div>
       </div>
    );
  }

  // --- WebSocket Status Badge ---
   const renderSocketStatus = () => {
     if (socketStatus === 'connecting') return <Badge variant="outline"><AlertCircle className='h-3 w-3 mr-1'/>Connecting...</Badge>;
     if (socketStatus === 'error') return <Badge variant="destructive"><WifiOff className='h-3 w-3 mr-1'/>Error: {socketError || 'Failed'}</Badge>;
     if (socketStatus === 'disconnected') return <Badge variant="secondary"><WifiOff className='h-3 w-3 mr-1'/>Offline</Badge>;
     return null; // Don't show anything if connected
   };

  // --- Main Content ---
  return (
    // Use grid layout for better responsiveness
    <div className="container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Left Column (or Main Column on smaller screens) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Incident Header & Details */}
            <div className="flex justify-between items-start mb-1">
                 <IncidentDetails incident={incident} />
                 <div className="flex-shrink-0 ml-4 mt-1"> {renderSocketStatus()}</div>
            </div>

            {/* Incident Chat */}
             <div>
                <h2 className="text-xl font-semibold mb-3 border-b pb-2">War Room Chat</h2>
                <IncidentChat
                    // users={users || []} // Pass users if needed for @mentions later
                    typingUsers={typingUsers}
                    onTyping={emitTyping} // Pass the emitTyping function
                    messages={messages}
                    onSendMessage={sendMessage}
                    incidentId={incident.id}
                    isLoading={socketStatus === 'connecting'}
                />
             </div>
        </div>

        {/* Right Column (Sidebar on larger screens) */}
        <div className="lg:col-span-1 space-y-6">
             {/* Status Update Control */}
             <div>
                <h3 className="text-lg font-semibold mb-2">Update Status</h3>
                <UpdateStatusControl incident={incident} />
             </div>

             {/* Task List */}
             <div>
                 <h2 className="text-xl font-semibold mb-3 border-b pb-2">Tasks</h2>
                 {tasksError && (
                      <div className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md flex items-center gap-2 text-sm">
                         <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                         <span>Error loading tasks: {tasksError.message}</span>
                         <Button variant="ghost" size="sm" onClick={() => refetchTasks()} className="ml-auto h-6 px-1">Retry</Button>
                      </div>
                 )}
                <TaskList
                    incidentId={incident.id}
                    tasks={tasks ?? []}
                    isLoading={isLoadingTasks}
                    // Pass current user role for potential RBAC within TaskList/TaskItem
                    currentUserRole={currentUserRole}
                    currentUserId={currentUserId}
                />
             </div>
        </div>
    </div>
  );
}