import { createWithEqualityFn as create } from "zustand/traditional";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  checkSessionExpiration: () => Promise<boolean>;
}

const SESSION_TOKEN_KEY = "better-auth.session_token";
const SESSION_EXPIRES_AT_KEY = "better-auth.session-expires-at";

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,

  checkSessionExpiration: async () => {
    try {
      const { authClient } = await import("@/services/auth-client");
      const { data, error } = await authClient.getSession();

      if (error || !data?.session) {
        await get().logout();
        return false;
      }

      set({ isAuthenticated: true });
      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      await get().logout();
      return false;
    }
  },

  login: async () => {
    try {
      const isValidSession = await get().checkSessionExpiration();
      set({ isAuthenticated: isValidSession });
    } catch (error) {
      console.error("Error establishing session:", error);
      set({ isAuthenticated: false });
    }
  },

  logout: async () => {
    try {
      const { authClient } = await import("@/services/auth-client");
      await authClient.signOut();
    } catch (error) {
      console.log("[AUTH] Sign-out request failed:", error);
    } finally {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SESSION_EXPIRES_AT_KEY);
      set({ isAuthenticated: false });
    }
  },

  loadSession: async () => {
    try {
      const { authClient } = await import("@/services/auth-client");
      const { data, error } = await authClient.getSession();

      if (!error && data?.session) {
        set({ isAuthenticated: true });
      } else {
        await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
        await SecureStore.deleteItemAsync(SESSION_EXPIRES_AT_KEY);
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error("Error loading session:", error);
      set({ isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
