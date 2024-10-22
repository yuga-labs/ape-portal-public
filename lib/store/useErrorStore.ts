import { create } from 'zustand';

interface ErrorState {
  /** A general error that needs to be displayed to the user. */
  error: string | undefined;
}

interface ErrorActions {
  setError: (error: string) => void;
  resetError: () => void;
}

/**
 * Store for managing application wide errors that need to be displayed to the user.
 */
export const useErrorStore = create<ErrorState & ErrorActions>((set) => ({
  error: undefined,
  setError: (error: string) => set({ error }),
  resetError: () => set({ error: undefined }),
}));
