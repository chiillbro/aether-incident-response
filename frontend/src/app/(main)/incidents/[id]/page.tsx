// frontend/src/app/(main)/incidents/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useIncidentById } from '@/hooks/api/useIncidentById';
import { useIncidentChannel } from '@/hooks/useIncidentChannel';
import { IncidentDetails } from '@/components/incidents/IncidentDetails';
// import { IncidentChat } from '@/components/incidents/chat/IncidentChat';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useSocketStore } from '@/store/socketStore';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Message } from '@/types';
import { IncidentChat } from '@/components/chat/IncidentChat';
import { Button } from '@/components/ui/button';


export default function IncidentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null; // Get ID from route
  const { status: socketStatus, error: socketError } = useSocketStore(); // Get WS status

  // Fetch incident details
  const { data: incident, isLoading: isLoadingIncident, error: incidentError, refetch } = useIncidentById(id);

   // WebSocket Hook state management moved inside
  const [messages, setMessages] = useState<Message[]>([]);
  const { messages: wsMessages, sendMessage, setMessages: setWsMessages } = useIncidentChannel(id); // Pass setMessages

  // Update local messages when WebSocket hook's messages change
  useEffect(() => {
     setMessages(wsMessages);
  }, [wsMessages]);


  // Display loading state
  if (isLoadingIncident) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
         <Skeleton className="h-10 w-3/4" />
         <Skeleton className="h-6 w-1/4" />
         <div className="flex gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
         </div>
         <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Display error state
  if (incidentError || !incident) {
    return (
       <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
             <AlertTriangle className="h-5 w-5"/>
             <span>
                 {incidentError ? `Error loading incident: ${incidentError.message}` : 'Incident not found.'}
             </span>
             <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
          </div>
       </div>
    );
  }

  // Display WebSocket status/error
   const renderSocketStatus = () => {
     if (socketStatus === 'connecting') return <Badge variant="outline">Chat Connecting...</Badge>;
     if (socketStatus === 'error') return <Badge variant="destructive">Chat Error: {socketError || 'Failed'}</Badge>;
     if (socketStatus === 'disconnected') return <Badge variant="secondary">Chat Disconnected</Badge>;
     // Implicitly connected if none of the above
     // return <Badge className="bg-green-500">Chat Connected</Badge>;
     return null; // Don't show anything if connected
   };


  // Display incident details and chat
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-start mb-4">
        <IncidentDetails incident={incident} />
        <div className="flex-shrink-0"> {renderSocketStatus()}</div>
      </div>
      <IncidentChat
         messages={messages}
         onSendMessage={sendMessage}
         incidentId={incident.id}
         isLoading={socketStatus === 'connecting'} // Pass loading state
      />
    </div>
  );
}