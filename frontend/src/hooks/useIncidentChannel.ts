import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/store/socketStore'; // Import Zustand store
import { Message } from '@/types'; // Import your Message type

// Define expected WebSocket event payloads
interface NewMessagePayload extends Message {} // Assuming backend sends full Message object
interface ErrorPayload { error: string; }
interface MessageHistoryPayload { incidentId: string; messages: Message[] }

export const useIncidentChannel = (incidentId: string | null | undefined) => {
  const { data: session } = useSession(); // Get session data (includes token)
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // This remains the source of truth
  const { status, setStatus, setError } = useSocketStore(); // Get actions from Zustand store

  console.log("messagesinuseIncidentChannel", messages)
  console.log("status", status)

  // Memoize the sendMessage function
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.disconnected || !incidentId) {
      console.error('Socket not connected or incidentId missing');
      // Optionally show an error toast
      return;
    }

    console.log("content", content);
    if(content.trim()){
      socketRef.current.emit('sendIncidentMessage', { incidentId, content });
    }
  }, [incidentId]); // Recreate only if incidentId changes


  useEffect(() => {
    // Ensure we have necessary data before connecting
    if (!incidentId || !session?.accessToken) {
        if (socketRef.current?.connected) {
            console.log('Disconnecting socket due to missing incidentId or token...');
            socketRef.current.disconnect();
        }
      return;
    }

    // Avoid reconnecting if already connected to the same incident
    // (Simple check, might need refinement based on socket state)
    // if (socketRef.current?.connected) {
    //     // Maybe check if connected to the *correct* room/incident?
    //     // For now, assume useEffect dependencies handle this correctly
    //     console.log('Socket already connected, skipping reconnect.');
    //     return;
    // }


    console.log(`Initializing socket connection for incident: ${incidentId}`);
    setStatus('connecting');

    // Establish connection - Use NEXT_PUBLIC_API_BASE_URL as WS usually runs on same server/port
    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      // path: '/events/socket.io', // Use if custom path is set on backend gateway
      // reconnection: true,
      // reconnectionAttempts: 5,
      // reconnectionDelay: 1000,
      // reconnectionDelayMax: 5000,
      // randomizationFactor: 0,
      timeout: 10000,
      auth: { // Send token for authentication
        token: session.accessToken,
      },
    });

    socketRef.current = newSocket;

    // --- Event Listeners ---
    // newSocket.on('connect', () => {
    //   console.log(`Socket connected: ${newSocket.id}`);
    //   setStatus('connected');
    //   // Join the specific incident room after successful connection
    //   newSocket.emit('joinIncidentRoom', { incidentId });
    // });

    // Listen for 'authenticated' event before joining the room
    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      setStatus('connected');
      if (incidentId) {
        newSocket.emit('joinIncidentRoom', { incidentId });
      }
    });

    // Listener for initial message history
    newSocket.on('messageHistory', (data: MessageHistoryPayload) => {
      if (data.incidentId === incidentId) { // Ensure history is for the current incident
          console.log(`Received message history for incident ${incidentId}:`, data.messages);
          // Replace existing messages with the history
          // Add simple timestamp check to prevent very old history overwriting newer live messages
          // (Might need more robust logic depending on exact timing)
          setMessages((prevMessages) => {
              // Basic strategy: Just replace if the hook has just initialized
              // More complex: Merge based on timestamps if needed
              if (prevMessages.length === 0) {
                  return data.messages;
              }
               // If prevMessages exist, maybe only add history messages older than the oldest current message?
               // For simplicity now, we'll just replace on first load.
               // Consider adding a flag to prevent replacing after initial load.
               return data.messages;
          });
      }
  });

    // newSocket.on('connect', () => {
    //   console.log(`Socket connected: ${newSocket.id}. Attempting to join room for incident: ${incidentId}`); // Log the ID being used
    //   setStatus('connected');
    //   if (incidentId) { // Add a check just in case
    //       newSocket.emit('joinIncidentRoom', { incidentId });
    //   } else {
    //       console.error("Cannot join room: incidentId is null or undefined at connect time!");
    //   }
    // });

    newSocket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setStatus('disconnected');
      // Clear messages on disconnect? Or keep them? Depends on UX requirements.
      // setMessages([]);
      if (reason === 'io server disconnect') {
         // Server forced disconnect, maybe auth issue?
         setError('Server disconnected. Check authentication.');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(`Connection failed: ${err.message}`); // Update store with error
      setStatus('error');
    });

    // Listen for errors emitted by the backend gateway (e.g., auth failure)
    newSocket.on('error', (payload: ErrorPayload | string) => {
        const errorMessage = typeof payload === 'string' ? payload : payload?.error || 'Unknown error';
        console.error('Socket error received:', errorMessage);
        setError(errorMessage); // Update store with error
        setStatus('error');
        // Consider if disconnect is needed based on error type
        if (errorMessage.toLowerCase().includes('authentication')) {
            newSocket.disconnect();
        }
    });

    // Listen for new messages for this incident
    newSocket.on('newIncidentMessage', (newMessage: NewMessagePayload) => {
      console.log('New message received:', newMessage);
      // Update message list, ensuring no duplicates if re-joining etc.
      setMessages((prevMessages) => {
          // Basic check to prevent adding duplicate messages by ID
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
          }
          return [...prevMessages, newMessage];
      });
    });

    // Listen for confirmation of joining room (optional)
    newSocket.on('joinedRoom', (data) => {
        console.log(`Successfully joined room: ${data.room} for incident ${data.incidentId}`);
        // Potentially trigger fetch of message history here if not done elsewhere
    });

    // --- Cleanup Function ---
    return () => {
      console.log(`Cleaning up socket for incident: ${incidentId}`);
      if (newSocket) {
         // Leave room before disconnecting (good practice)
         newSocket.off("authenticated");
         newSocket.off("messageHistory");
         newSocket.emit('leaveIncidentRoom', { incidentId });
         newSocket.off('connect'); // Remove listeners
         newSocket.off('disconnect');
         newSocket.off('connect_error');
         newSocket.off('error');
         newSocket.off('newIncidentMessage');
         newSocket.off('joinedRoom');
         newSocket.disconnect();
         socketRef.current = null;
         setStatus('disconnected'); // Update status on explicit cleanup
      }
    };
  }, [incidentId, session?.accessToken, setStatus, setError]); // Dependencies

  return { messages, sendMessage, setMessages }; // Return state and function
};