import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/auth-store';
import { Inter_700Bold, Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { Anton_400Regular } from '@expo-google-fonts/anton';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, loadToken, checkTokenExpiration } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Anton_400Regular,
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await loadToken();
      } catch (e) {
        console.warn('Erro ao carregar token:', e);
      } finally {
        if (fontsLoaded) {
          setAppIsReady(true);
          await SplashScreen.hideAsync();
        }
      }
    };

    if (fontsLoaded) {
      prepareApp();
    }
  }, [fontsLoaded, loadToken]);

  // Navegação baseada na autenticação
  useEffect(() => {
    if (!appIsReady) return;

    const currentGroup = segments[0]; // exemplo: '(auth)' ou '(app)'

    if (!isAuthenticated) {
      if (currentGroup !== '(auth)') {
        router.replace('/(auth)/intro');
      }
    } else {
      if (currentGroup !== '(app)') {
        router.replace('/(app)/dashboard');
      }
    }
  }, [isAuthenticated, appIsReady, segments, router]);

  // Verificação periódica de expiração do token
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await checkTokenExpiration();
      if (!isValid) {
        console.log('Token expirou, deslogando...');
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiration]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView className="flex-1">
        <Slot />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
