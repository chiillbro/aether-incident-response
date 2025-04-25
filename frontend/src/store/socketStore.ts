// // frontend/src/store/socketStore.ts
// import { create } from 'zustand';

// export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// interface SocketState {
//   status: SocketStatus;
//   error: string | null;
//   setStatus: (status: SocketStatus) => void;
//   setError: (error: string | null) => void;
// }

// export const useSocketStore = create<SocketState>((set) => ({
//   status: 'disconnected',
//   error: null,
//   setStatus: (status) => set({ status, error: status === 'error' ? 'Connection failed' : null }), // Reset error on non-error status
//   setError: (error) => set({ status: 'error', error }),
// }));


// frontend/src/store/socketStore.ts
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner'; // For displaying connection errors
import { BellRing } from 'lucide-react';

// Define types used across hooks
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export interface NotificationPayload { title?: string; message: string; type: 'user' | 'team' | 'broadcast'; /* ... other fields */ }
export interface ErrorPayload { error: string; }

interface SocketState {
  socket: Socket | null;
  status: SocketStatus;
  error: string | null;
  connect: (token: string, user: { id: string; teamId?: string | null }) => void;
  disconnect: () => void;
  // Listener setup moved outside or handled via specific hooks accessing the socket
}

let socketInstance: Socket | null = null; // Keep instance outside store to avoid serialization issues if needed

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  status: 'disconnected',
  error: null,

  connect: (token, user) => {
    // Prevent multiple connections
    if (get().socket?.connected || get().status === 'connecting') {
        console.warn("SOCKET STORE: Connection attempt ignored, already connected or connecting.");
        return;
    }

    console.log(`SOCKET STORE: Initializing connection for user ${user.id}...`);
    set({ status: 'connecting', error: null });

    const socketBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/server-api', '');
    if (!socketBaseUrl) {
      console.error("SOCKET STORE: NEXT_PUBLIC_API_BASE_URL is not defined!");
      set({ status: 'error', error: "API URL missing" });
      return;
    }

    // Disconnect previous instance if any (safety measure)
    if (socketInstance) {
        socketInstance.disconnect();
    }

    const newSocket = io(socketBaseUrl, {
      path: '/server-api/socket.io',
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token },
      transports: ["websocket", "polling"],
      // autoConnect: false, // Consider manual connection if needed elsewhere
    });

    // --- Standard Listeners Handled by Store ---
    newSocket.on('connect', () => {
      console.log(`SOCKET STORE: Connected (${newSocket.id}). Waiting for authentication...`);
      // Status update waits for 'authenticated' event
    });

    newSocket.on('authenticated', (data) => {
      console.log('SOCKET STORE: Authenticated:', data.user?.email);
      set({ status: 'connected', socket: newSocket, error: null }); // Update state with socket instance

      // Join general rooms after authentication
      if (user.teamId) {
          console.log(`SOCKET STORE: Emitting joinTeamRoom for ${user.teamId}`);
          newSocket.emit('joinTeamRoom', { teamId: user.teamId });
      }

      // --- Subscribe to Broadcast ---
      console.log("GLOBAL WS: Emitting joinBroadcastRoom");
      newSocket.emit('joinBroadcastRoom'); // Assume backend handles this
      // newSocket.emit('joinBroadcastRoom'); // If using broadcast
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`SOCKET STORE: Disconnected: ${reason}`);
      const isAuthError = reason === 'io server disconnect';
      set({
          socket: null,
          status: 'disconnected',
          error: isAuthError ? 'Server disconnected (check auth)' : null
      });
      socketInstance = null; // Clear external instance ref
    });

    newSocket.on('connect_error', (err) => {
      console.error('SOCKET STORE: Connection error:', err.message);
      set({ socket: null, status: 'error', error: `Connection failed: ${err.message}` });
      socketInstance = null;
    });

    // --- Global Notification Listener ---
     newSocket.on('receiveNotification', (data: NotificationPayload) => {
       console.log('SOCKET STORE: Received Notification:', data);
       toast(data.title || "Notification", {
         description: data.message,
        //  icon: <BellRing className="h-4 w-4" />,
       });
     });
     // ---------------------------------

     // --- General Error Listener ---
     newSocket.on('error', (payload: ErrorPayload | string) => {
        const msg = typeof payload === 'string' ? payload : payload?.error || 'Unknown WS error';
        console.error('SOCKET STORE: Error received:', msg);
        set({ status: 'error', error: msg });
        if (msg.toLowerCase().includes('authentication')) { newSocket.disconnect(); }
     });
     // -----------------------------

     socketInstance = newSocket; // Store instance
    // newSocket.connect(); // Connect if autoConnect is false

     // IMPORTANT: Store doesn't return cleanup, lifecycle managed by connect/disconnect actions
  },

  disconnect: () => {
    console.log('SOCKET STORE: Disconnect action called.');
    const socket = get().socket;
    if (socket) {
        // We don't need to emit leaveTeamRoom here as the store cleanup handles it
        socket.disconnect();
    }
    set({ socket: null, status: 'disconnected', error: null });
    socketInstance = null;
  },
}));

// Optional: Selector to easily get the socket instance
export const useSocket = () => useSocketStore((state) => state.socket);