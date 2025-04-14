// frontend/src/store/socketStore.ts
import { create } from 'zustand';

export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface SocketState {
  status: SocketStatus;
  error: string | null;
  setStatus: (status: SocketStatus) => void;
  setError: (error: string | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  status: 'disconnected',
  error: null,
  setStatus: (status) => set({ status, error: status === 'error' ? 'Connection failed' : null }), // Reset error on non-error status
  setError: (error) => set({ status: 'error', error }),
}));