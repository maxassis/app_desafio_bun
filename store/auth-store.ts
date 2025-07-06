// import { create } from 'zustand';
// import * as SecureStore from 'expo-secure-store';

// interface AuthState {
//   isAuthenticated: boolean;
//   token: string | null;
//   login: (token: string) => Promise<void>;
//   logout: () => Promise<void>;
//   loadToken: () => Promise<void>;
// }

// const TOKEN_KEY = 'token-desafio';

// const useAuthStore = create<AuthState>((set) => ({
//   isAuthenticated: false,
//   token: null,

//   login: async (token: string) => {
//     try {
//       await SecureStore.setItemAsync(TOKEN_KEY, token);
//       set({ isAuthenticated: true, token });
//     } catch (error) {
//       console.error('Error storing the token', error);
//     }
//   },

//   logout: async () => {
//     try {
//       await SecureStore.deleteItemAsync(TOKEN_KEY);
//       set({ isAuthenticated: false, token: null });
//     } catch (error) {
//       console.error('Error removing the token', error);
//     }
//   },

//   loadToken: async () => {
//     try {
//       const token = await SecureStore.getItemAsync(TOKEN_KEY);
//       if (token) {
//         set({ isAuthenticated: true, token });
//       }
//     } catch (error) {
//       console.error('Error loading the token', error);
//     }
//   }
// }));

// export default useAuthStore;

// import { create } from 'zustand';
// import * as SecureStore from 'expo-secure-store';

// interface AuthState {
//   isAuthenticated: boolean;
//   token: string | null;
//   login: (token: string) => Promise<void>;
//   logout: () => Promise<void>;
//   loadToken: () => Promise<void>;
// }

// const TOKEN_KEY = 'token-desafio';

// const useAuthStore = create<AuthState>((set) => ({
//   isAuthenticated: false,
//   token: null,

//   login: async (token: string) => {
//     try {
//       await SecureStore.setItemAsync(TOKEN_KEY, token);
//       set({ isAuthenticated: true, token });
//     } catch (error) {
//       console.error('Error storing the token:', error);
//     }
//   },

//   logout: async () => {
//     try {
//       await SecureStore.deleteItemAsync(TOKEN_KEY);
//       set({ isAuthenticated: false, token: null });
//     } catch (error) {
//       console.error('Error removing the token:', error);
//     }
//   },

//   loadToken: async () => {
//     try {
//       const token = await SecureStore.getItemAsync(TOKEN_KEY);
//       if (token) {
//         console.log(token);
//         set({ isAuthenticated: true, token });
//       } else {
//         set({ isAuthenticated: false, token: null });
//       }
//     } catch (error) {
//       console.error('Error loading the token:', error);
//       set({ isAuthenticated: false, token: null });
//     }
//   }
// }));

// export default useAuthStore;

import { createWithEqualityFn as create } from 'zustand/traditional';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  isTokenExpired: (token?: string) => boolean;
  checkTokenExpiration: () => Promise<boolean>;
}

const TOKEN_KEY = 'token-desafio';

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  token: null,

  isTokenExpired: (token?: string) => {
    try {
      const tokenToCheck = token || get().token;
      if (!tokenToCheck) return true;

      const decoded = jwtDecode(tokenToCheck);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp ? decoded.exp < currentTime : true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  checkTokenExpiration: async () => {
    const { token, isTokenExpired, logout } = get();
    
    if (!token || isTokenExpired(token)) {
      await logout();
      return false;
    }
    return true;
  },

  login: async (token: string) => {
    try {
      const { isTokenExpired } = get();
      
      // Verifica se o token não está expirado antes de fazer login
      if (isTokenExpired(token)) {
        console.error('Cannot login with expired token');
        return;
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ isAuthenticated: true, token });
    } catch (error) {
      console.error('Error storing the token:', error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ isAuthenticated: false, token: null });
    } catch (error) {
      console.error('Error removing the token:', error);
    }
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const { isTokenExpired } = get();
      
      if (token && !isTokenExpired(token)) {
        set({ isAuthenticated: true, token });
      } else {
        // Token expirado ou não existe, remove do storage
        if (token) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
        set({ isAuthenticated: false, token: null });
      }
    } catch (error) {
      console.error('Error loading the token:', error);
      set({ isAuthenticated: false, token: null });
    }
  }
}));

export default useAuthStore;