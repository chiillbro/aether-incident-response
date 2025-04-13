// frontend/src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  // Example state - you might not need this if useSession covers everything
  isLoadingAuth: boolean;
  setIsLoadingAuth: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoadingAuth: true, // Initially assume loading until session is checked
  setIsLoadingAuth: (loading) => set({ isLoadingAuth: loading }),
}));

// You could potentially sync useSession status here if needed, but it adds complexity.
// It's often simpler to use useSession directly where needed.