// // frontend/src/hooks/useGlobalNotifications.ts
// import { useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useSession } from 'next-auth/react';
// import { useSocketStore } from '@/store/socketStore';
// import { toast } from 'sonner';
// import { BellRing } from 'lucide-react'; // Example icon
// import { ErrorPayload } from './useIncidentChannel';

// // Define expected payload structure
// interface NotificationPayload {
//     title?: string;
//     message: string;
//     type: 'user' | 'team' | 'broadcast';
//     timestamp?: string; // Optional
//     // Add other relevant fields like severity, link, etc.
// }

// // Hook to manage the global notification socket connection
// export const useGlobalNotifications = () => {
//   const { data: session, status: sessionStatus } = useSession();
//   const socketRef = useRef<Socket | null>(null);
//   // Use global store primarily for connection status, not message state
//   const { setStatus, setError } = useSocketStore();

//   useEffect(() => {
//     // Only connect if authenticated
//     if (sessionStatus !== 'authenticated' || !session?.accessToken || !session?.user?.id) {
//       if (socketRef.current?.connected) {
//         console.log('GLOBAL WS: Disconnecting, user not authenticated.');
//         socketRef.current.disconnect();
//       }
//       return;
//     }

//     // Avoid reconnect if already connected
//     if (socketRef.current?.connected) {
//        // console.log('GLOBAL WS: Already connected.');
//        return;
//     }

//     const userId = session.user.id;
//     const teamId = session.user.teamId; // Get team ID if available

//     console.log(`GLOBAL WS: Initializing connection for user ${userId}...`);
//     setStatus('connecting');

//     const socketBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/server-api', '');
//     if (!socketBaseUrl) {
//         console.error("GLOBAL WS: NEXT_PUBLIC_API_BASE_URL is not defined!");
//         setError("API URL configuration missing.");
//         setStatus('error');
//         return;
//     }

//     const newSocket = io(socketBaseUrl, {
//       path: '/server-api/socket.io', // Match backend gateway path
//       reconnectionAttempts: 5,
//       timeout: 10000,
//       auth: { token: session.accessToken },
//       transports: ["websocket", "polling"],
//     });
//     socketRef.current = newSocket;

//     // --- Event Listeners ---
//     newSocket.on('authenticated', (data) => { // Listen for auth confirmation
//       console.log('GLOBAL WS: Authenticated:', data.user?.email);
//       setStatus('connected');
//       // Now attempt to join the team room if applicable
//       if (teamId) {
//          console.log(`GLOBAL WS: Emitting joinTeamRoom for team ${teamId}`);
//          newSocket.emit('joinTeamRoom', { teamId });
//       }
//       // Optionally join a general 'broadcast' room if backend uses one
//       // newSocket.emit('joinBroadcastRoom');
//     });

//     newSocket.on('receiveNotification', (data: NotificationPayload) => {
//       console.log('GLOBAL WS: Received Notification:', data);
//       // Use Sonner to display the toast
//       toast(data.title || "Notification", { // Title defaults to "Notification"
//         description: data.message,
//         // icon: (<BellRing className="h-4 w-4" />),
//         // Add actions or links based on notification type/content later
//       });
//       // TODO: Update an unread count in a global state store (e.g., Zustand)
//       //       if implementing a notification center.
//     });

//     newSocket.on('connect', () => console.log(`GLOBAL WS: Socket connected: ${newSocket.id}`));

//     newSocket.on('disconnect', (reason) => {
//       console.log(`GLOBAL WS: Socket disconnected: ${reason}`);
//       setStatus('disconnected');
//       if (reason === 'io server disconnect') {
//         setError('Server disconnected. Auth issue?');
//       }
//     });

//     newSocket.on('connect_error', (err) => {
//       console.error('GLOBAL WS: Connection error:', err.message);
//       setError(`Connection failed: ${err.message}`);
//       setStatus('error');
//     });

//     newSocket.on('error', (payload: ErrorPayload | string) => {
//       const msg = typeof payload === 'string' ? payload : payload?.error || 'Unknown WS error';
//       console.error('GLOBAL WS: Error received:', msg);
//       setError(msg);
//       setStatus('error');
//       if (msg.toLowerCase().includes('authentication')) { newSocket.disconnect(); }
//     });

//     // --- Cleanup ---
//     return () => {
//       console.log(`GLOBAL WS: Cleaning up socket for user ${userId}`);
//       if (newSocket) {
//         // Leave rooms before disconnecting
//         if (teamId) newSocket.emit('leaveTeamRoom', { teamId });
//         // if (broadcastRoomJoined) newSocket.emit('leaveBroadcastRoom');

//         // Remove all listeners
//         newSocket.off('authenticated');
//         newSocket.off('receiveNotification');
//         newSocket.off('connect');
//         newSocket.off('disconnect');
//         newSocket.off('connect_error');
//         newSocket.off('error');

//         newSocket.disconnect();
//         socketRef.current = null;
//         // Don't necessarily set status to disconnected here unless sure no other hook uses it
//         // setStatus('disconnected');
//       }
//     };
//   // Dependencies ensure re-connection if session/user/team changes
//   }, [sessionStatus, session?.accessToken, session?.user?.id, session?.user?.teamId, setStatus, setError]);

//   // This hook doesn't need to return anything, it just sets up the listener
// };