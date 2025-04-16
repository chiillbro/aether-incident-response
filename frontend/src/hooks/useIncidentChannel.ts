// import { useEffect, useRef, useState, useCallback } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useSession } from 'next-auth/react';
// import { useSocketStore } from '@/store/socketStore'; // Import Zustand store
// import { Message } from '@/types'; // Import your Message type
// import { useQueryClient } from '@tanstack/react-query';

// // Define expected WebSocket event payloads
// interface NewMessagePayload extends Message {} // Assuming backend sends full Message object
// interface ErrorPayload { error: string; }
// interface MessageHistoryPayload { incidentId: string; messages: Message[] }

// export const useIncidentChannel = (incidentId: string | null | undefined) => {
//   const { data: session } = useSession(); // Get session data (includes token)
//   const socketRef = useRef<Socket | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]); // This remains the source of truth
//   const { setStatus, setError } = useSocketStore(); // Get actions from Zustand store

//   const [typingUsers, setTypingUsers] = useState<string[]>([]);
//   const typingTimeout = useRef<NodeJS.Timeout>(undefined);


//   const queryClient = useQueryClient();

//   // Memoize the sendMessage function
//   const sendMessage = useCallback((content: string) => {
//     if (!socketRef.current || socketRef.current.disconnected || !incidentId) {
//       console.error('Socket not connected or incidentId missing');
//       // Optionally show an error toast
//       return;
//     }

//     if(content.trim()){
//       socketRef.current.emit('sendIncidentMessage', { incidentId, content });
//     }
//   }, [incidentId]); // Recreate only if incidentId changes

//   // Add typing handlers
//   const handleTyping = useCallback(() => {
//     if (incidentId && socketRef.current?.connected) {
//       socketRef.current.emit('typing', { incidentId });
//       clearTimeout(typingTimeout.current);
//       typingTimeout.current = setTimeout(() => {
//         socketRef.current?.emit('stopTyping', incidentId);
//       }, 1500);
//     }
//   }, [incidentId]);


//   useEffect(() => {
//     // Ensure we have necessary data before connecting
//     if (!incidentId || !session?.accessToken) {
//         if (socketRef.current?.connected) {
//             console.log('Disconnecting socket due to missing incidentId or token...');
//             socketRef.current.disconnect();
//         }
//       return;
//     }

//     // Avoid reconnecting if already connected to the same incident
//     // (Simple check, might need refinement based on socket state)
//     // if (socketRef.current?.connected) {
//     //     // Maybe check if connected to the *correct* room/incident?
//     //     // For now, assume useEffect dependencies handle this correctly
//     //     console.log('Socket already connected, skipping reconnect.');
//     //     return;
//     // }


//     console.log(`Initializing socket connection for incident: ${incidentId}`);
//     setStatus('connecting');

//     // Establish connection - Use NEXT_PUBLIC_API_BASE_URL as WS usually runs on same server/port
//     const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
//     const newSocket = io(socketUrl, {
//       // path: '/events/socket.io', // Use if custom path is set on backend gateway
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       randomizationFactor: 0,
//       timeout: 10000,
//       auth: { // Send token for authentication
//         token: session.accessToken,
//       },
//     });

//     socketRef.current = newSocket;

//     // --- Event Listeners ---
//     // newSocket.on('connect', () => {
//     //   console.log(`Socket connected: ${newSocket.id}`);
//     //   setStatus('connected');
//     //   // Join the specific incident room after successful connection
//     //   newSocket.emit('joinIncidentRoom', { incidentId });
//     // });

//     // Listen for 'authenticated' event before joining the room
//     newSocket.on('authenticated', (data) => {
//       console.log('Socket authenticated:', data);
//       setStatus('connected');
//       if (incidentId) {
//         newSocket.emit('joinIncidentRoom', { incidentId });
//       }
//     });

//     // Listener for initial message history
//     newSocket.on('messageHistory', (data: MessageHistoryPayload) => {
//       if (data.incidentId === incidentId) { // Ensure history is for the current incident
//           console.log(`Received message history for incident ${incidentId}:`, data.messages);
//           // Replace existing messages with the history
//           // Add simple timestamp check to prevent very old history overwriting newer live messages
//           // (Might need more robust logic depending on exact timing)
//           setMessages((prevMessages) => {
//               // Basic strategy: Just replace if the hook has just initialized
//               // More complex: Merge based on timestamps if needed
//               if (prevMessages.length === 0) {
//                   return data.messages;
//               }
//                // If prevMessages exist, maybe only add history messages older than the oldest current message?
//                // For simplicity now, we'll just replace on first load.
//                // Consider adding a flag to prevent replacing after initial load.
//                return data.messages;
//           });
//       }
//   });

//     // newSocket.on('connect', () => {
//     //   console.log(`Socket connected: ${newSocket.id}. Attempting to join room for incident: ${incidentId}`); // Log the ID being used
//     //   setStatus('connected');
//     //   if (incidentId) { // Add a check just in case
//     //       newSocket.emit('joinIncidentRoom', { incidentId });
//     //   } else {
//     //       console.error("Cannot join room: incidentId is null or undefined at connect time!");
//     //   }
//     // });

//     newSocket.on('disconnect', (reason) => {
//       console.log(`Socket disconnected: ${reason}`);
//       setStatus('disconnected');
//       // Clear messages on disconnect? Or keep them? Depends on UX requirements.
//       // setMessages([]);
//       if (reason === 'io server disconnect') {
//          // Server forced disconnect, maybe auth issue?
//          setError('Server disconnected. Check authentication.');
//       }
//     });

//     newSocket.on('connect_error', (err) => {
//       console.error('Socket connection error:', err.message);
//       setError(`Connection failed: ${err.message}`); // Update store with error
//       setStatus('error');
//     });

//     // Listen for errors emitted by the backend gateway (e.g., auth failure)
//     newSocket.on('error', (payload: ErrorPayload | string) => {
//         const errorMessage = typeof payload === 'string' ? payload : payload?.error || 'Unknown error';
//         console.error('Socket error received:', errorMessage);
//         setError(errorMessage); // Update store with error
//         setStatus('error');
//         // Consider if disconnect is needed based on error type
//         if (errorMessage.toLowerCase().includes('authentication')) {
//             newSocket.disconnect();
//         }
//     });

//     // Listen for new messages for this incident
//     newSocket.on('newIncidentMessage', (newMessage: NewMessagePayload) => {
//       console.log('New message received:', newMessage);
//       // Update message list, ensuring no duplicates if re-joining etc.
//       setMessages((prevMessages) => {
//           // Basic check to prevent adding duplicate messages by ID
//           if (prevMessages.some(msg => msg.id === newMessage.id)) {
//               return prevMessages;
//           }
//           return [...prevMessages, newMessage];
//       });
//     });

//     // // Add to message reception
//     // newSocket.on('newIncidentMessage', (newMessage: NewMessagePayload) => {
//     //   queryClient.setQueryData<Message[]>(['messages', incidentId], (old) => {
//     //     const existing = old?.find(m => m.id === newMessage.id);
//     //     return existing ? old : [...(old || []), newMessage];
//     //   });
//     // });

//     // Listen for confirmation of joining room (optional)
//     newSocket.on('joinedRoom', (data) => {
//         console.log(`Successfully joined room: ${data.room} for incident ${data.incidentId}`);
//         // Potentially trigger fetch of message history here if not done elsewhere
//     });


//     // --- Typing Event Listeners ---
//     newSocket.on('userTyping', (userId: string) => {
//       setTypingUsers(prev => [...new Set([...prev, userId])]);
//     });

//     newSocket.on('userStoppedTyping', (userId: string) => {
//       setTypingUsers(prev => prev.filter(id => id !== userId));
//     });


//     // --- Cleanup Function ---
//     return () => {
//       console.log(`Cleaning up socket for incident: ${incidentId}`);
//       if (newSocket) {
//          // Leave room before disconnecting (good practice)
//          newSocket.off("authenticated");
//          newSocket.off("messageHistory");
//          newSocket.emit('leaveIncidentRoom', { incidentId });
//          newSocket.off('connect'); // Remove listeners
//          newSocket.off('disconnect');
//          newSocket.off('connect_error');
//          newSocket.off('error');
//          newSocket.off('newIncidentMessage');
//          newSocket.off('joinedRoom');
//          newSocket.off('userTyping');
//          newSocket.off('userStoppedTyping');
//          newSocket.disconnect();
//          socketRef.current = null;
//          setStatus('disconnected'); // Update status on explicit cleanup
//       }
//     };
//   }, [incidentId, session?.accessToken, setStatus, setError]); // Dependencies

//   return { messages, sendMessage, setMessages, typingUsers, handleTyping }; // Return state and function
// };

// frontend/src/hooks/useIncidentChannel.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/store/socketStore';
import { Message, Incident, Task, IncidentStatus, UserSnippet } from '@/types'; // Import needed types
import { useQueryClient } from '@tanstack/react-query';

// Define expected WebSocket event payloads
interface NewMessagePayload extends Message {}
interface ErrorPayload { error: string; }
interface MessageHistoryPayload { incidentId: string; messages: Message[] }
interface IncidentStatusUpdatePayload {
    incidentId: string;
    status: IncidentStatus;
    updatedBy: { id: string, name: string } | null;
}
interface TaskCreatedPayload extends Task {}
interface TaskUpdatedPayload extends Task {}
interface TaskDeletedPayload { taskId: string; }
interface UserTypingPayload { userId: string; userName: string; } // Add userName for display
interface UserStoppedTypingPayload { userId: string; }

export const useIncidentChannel = (incidentId: string | null | undefined) => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const { setStatus, setError } = useSocketStore();
  const queryClient = useQueryClient(); // Get query client instance

  // Local state for messages (often useful for immediate UI updates before cache sync)
  const [messages, setMessages] = useState<Message[]>([]);
  // Local state for who is currently typing (Map: userId -> userName)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const isConnecting = useRef(false); // Prevent multiple connection attempts


  // --- Memoized Functions ---
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.disconnected || !incidentId) {
      console.error('WS: Socket not connected or incidentId missing for sendMessage');
      return;
    }
    if (content.trim()) {
       console.log(`WS: Emitting sendIncidentMessage for incident ${incidentId}`);
      socketRef.current.emit('sendIncidentMessage', { incidentId, content });
    }
  }, [incidentId]);

  const emitTyping = useCallback(() => {
      if (incidentId && socketRef.current?.connected) {
          // Basic throttling could be added here if needed
          console.log(`WS: Emitting typing for incident ${incidentId}`);
          socketRef.current.emit('typing', { incidentId });
      }
  }, [incidentId]);

  // --- WebSocket Connection Effect ---
  useEffect(() => {
    if (!incidentId || !session?.accessToken || isConnecting.current) {
      // Clean disconnect if dependencies change while connected
      if (socketRef.current?.connected && (!incidentId || !session?.accessToken)) {
          console.log('WS: Disconnecting socket due to missing incidentId or token change.');
          socketRef.current.disconnect();
      }
      return;
    }

    // Prevent race conditions on rapid re-renders
    isConnecting.current = true;

    console.log(`WS: Initializing connection for incident: ${incidentId}`);
    setStatus('connecting');

    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token: session.accessToken },
    });

    socketRef.current = newSocket;

    // --- Event Listeners ---
    newSocket.on('authenticated', (data) => {
      console.log('WS: Authenticated:', data.user?.email);
      setStatus('connected');
      if (incidentId) {
         console.log(`WS: Emitting joinIncidentRoom for ${incidentId}`);
         newSocket.emit('joinIncidentRoom', { incidentId });

         // Attempt to join team room based on user's session data
         // This allows receiving broader notifications (e.g., new incidents for the team)
         const teamId = session.user?.teamId;
         if (teamId) {
             console.log(`WS: Emitting joinTeamRoom for team ${teamId}`);
             newSocket.emit('joinTeamRoom', { teamId });
         }
      }
       isConnecting.current = false; // Connection attempt finished
    });

    newSocket.on('messageHistory', (data: MessageHistoryPayload) => {
      if (data.incidentId === incidentId) {
        console.log(`WS: Received message history (${data.messages.length} messages)`);
        setMessages(data.messages); // Reset local state with history
      }
    });

    newSocket.on('newIncidentMessage', (newMessage: NewMessagePayload) => {
      if (newMessage.incidentId === incidentId) {
          console.log('WS: Received newIncidentMessage:', newMessage.id);
          // Update local state immediately
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev; // Prevent duplicates
            return [...prev, newMessage];
          });
          // Optionally update React Query cache as well
          // queryClient.setQueryData(['messages', incidentId], ...); // Less critical if using local state primarily
      }
    });

    newSocket.on('incidentStatusUpdated', (data: IncidentStatusUpdatePayload) => {
      if (data.incidentId === incidentId) {
          console.log(`WS: Received incidentStatusUpdated to ${data.status}`);
          // Update React Query cache for the incident
          queryClient.setQueryData(['incident', incidentId], (oldData?: Incident) => {
            if (!oldData) return undefined;
            return { ...oldData, status: data.status, updatedAt: new Date().toISOString() }; // Update status and timestamp
          });
          // Optional: Show a toast notification about the status change
          // toast.info(`Incident status updated to ${data.status} by ${data.updatedBy?.name || 'system'}`);
      }
    });

    newSocket.on('taskCreated', (newTask: TaskCreatedPayload & { owner: string }) => {
      if (newTask.incidentId === incidentId && newTask.owner !== session?.user?.id) {
          console.log('WS: Received taskCreated:', newTask.id);
          // Update React Query cache for tasks
          queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
            console.log("oldData", oldData)
            if (oldData?.some(task => task.id === newTask.id)) return oldData; // Prevent duplicates
            return oldData ? [...oldData, newTask] : [newTask];
          });
      }
    });

    newSocket.on('taskUpdated', (updatedTask: TaskUpdatedPayload) => {
      if (updatedTask.incidentId === incidentId) {
          console.log('WS: Received taskUpdated:', updatedTask.id);
          // Update React Query cache for tasks
          queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
            return oldData?.map(task => task.id === updatedTask.id ? updatedTask : task) ?? [];
          });
      }
    });

    newSocket.on('taskDeleted', (data: TaskDeletedPayload) => {
        // Need incidentId to update the correct query cache
        // Backend should ideally include incidentId in this event payload
        // Assuming for now we only get this event when in the incident room:
       if (incidentId) {
            console.log('WS: Received taskDeleted:', data.taskId);
            queryClient.setQueryData(['tasks', incidentId], (oldData?: Task[]) => {
              return oldData?.filter(task => task.id !== data.taskId) ?? [];
            });
       } else {
           console.warn("WS: Received taskDeleted event but incidentId is unclear.");
       }
    });

    newSocket.on('userTyping', (data: UserTypingPayload) => {
        setTypingUsers(prev => new Map(prev).set(data.userId, data.userName));
    });

    newSocket.on('userStoppedTyping', (data: UserStoppedTypingPayload) => {
        setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
        });
    });

    // Standard connection lifecycle listeners
    newSocket.on('connect', () => {
        console.log(`WS: Socket connected: ${newSocket.id}`);
        // Authentication happens via 'authenticated' event now
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`WS: Socket disconnected: ${reason}`);
      setStatus('disconnected');
      setTypingUsers(new Map()); // Clear typing users on disconnect
      isConnecting.current = false; // Allow reconnect attempt
      if (reason === 'io server disconnect') {
        setError('Server disconnected. Auth issue?');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('WS: Connection error:', err.message);
      setError(`Connection failed: ${err.message}`);
      setStatus('error');
      setTypingUsers(new Map());
      isConnecting.current = false; // Allow retry/reconnect attempt
    });

    newSocket.on('error', (payload: ErrorPayload | string) => {
      const msg = typeof payload === 'string' ? payload : payload?.error || 'Unknown WS error';
      console.error('WS: Error received:', msg);
      setError(msg);
      setStatus('error');
      if (msg.toLowerCase().includes('authentication')) { newSocket.disconnect(); }
       isConnecting.current = false; // Allow retry
    });

    // --- Cleanup Function ---
    return () => {
      console.log(`WS: Cleaning up socket for incident: ${incidentId}`);
      isConnecting.current = false; // Reset connection flag
      if (newSocket) {
        newSocket.off('authenticated');
        newSocket.off('messageHistory');
        newSocket.off('newIncidentMessage');
        newSocket.off('incidentStatusUpdated');
        newSocket.off('taskCreated');
        newSocket.off('taskUpdated');
        newSocket.off('taskDeleted');
        newSocket.off('userTyping');
        newSocket.off('userStoppedTyping');
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('error');
        if (incidentId) newSocket.emit('leaveIncidentRoom', { incidentId });
        const teamId = session?.user?.teamId;
        if (teamId) newSocket.emit('leaveTeamRoom', { teamId });
        newSocket.disconnect();
        socketRef.current = null;
        setStatus('disconnected');
      }
    };
    // Ensure session.user change triggers reconnect if needed (though token change is main driver)
  }, [incidentId, session?.accessToken, session?.user?.teamId, setStatus, setError, queryClient]);

  return { messages, sendMessage, emitTyping, typingUsers }; // Return state and functions
};