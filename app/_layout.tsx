// import React, { useEffect, useState } from 'react';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Slot, useRouter, useSegments } from 'expo-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import * as SplashScreen from 'expo-splash-screen';
// import useAuthStore from '../store/auth-store';
// import { Inter_700Bold, Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
// import { Anton_400Regular } from '@expo-google-fonts/anton';

// SplashScreen.preventAutoHideAsync();

// const queryClient = new QueryClient();

// export default function RootLayout() {
//   const { isAuthenticated, loadToken } = useAuthStore();
//   const router = useRouter();
//   const segments = useSegments();
//   const [appIsReady, setAppIsReady] = useState(false);

//   const [fontsLoaded] = useFonts({
//     Inter_700Bold,
//     Inter_400Regular,
//     Anton_400Regular,
//   });

//   useEffect(() => {
//     const prepareApp = async () => {
//       try {
//         await loadToken();

//         if (fontsLoaded) {
//           setAppIsReady(true); // Indica que o app está pronto
//           await SplashScreen.hideAsync(); // Esconde a splash screen
//         }
//       } catch (error) {
//         console.warn(error);
//       }
//     };

//     prepareApp();
//   }, [fontsLoaded]);

//   // useEffect(() => {
//   //   if (appIsReady) {
//   //     if (!isAuthenticated && segments[1] !== 'intro') {
//   //       router.replace('/intro');
//   //     } else if (isAuthenticated && segments[1] !== 'dashboard') {
//   //       router.replace('/buy');
//   //     }
//   //   }
//   // }, [isAuthenticated, appIsReady]);

//   useEffect(() => {
//     if (appIsReady) {
//       if (!isAuthenticated && segments[0] !== 'intro') {
//         router.replace('/intro');
//       } else if (isAuthenticated && segments[0] !== 'dashboard') {
//         router.replace('/dashboard');
//       }
//     }
//   }, [isAuthenticated, appIsReady]);

//   // Enquanto o app não está pronto, não renderiza nada (mantém a splash screen)
//   if (!appIsReady) {
//     return null; 
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <GestureHandlerRootView className="flex-1">
//         <Slot />
//       </GestureHandlerRootView>
//     </QueryClientProvider>
//   );
// }

// import React, { useEffect, useState } from 'react';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Slot, useRouter, useSegments } from 'expo-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import * as SplashScreen from 'expo-splash-screen';
// import useAuthStore from '../store/auth-store';
// import { Inter_700Bold, Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
// import { Anton_400Regular } from '@expo-google-fonts/anton';

// SplashScreen.preventAutoHideAsync();

// const queryClient = new QueryClient();

// export default function RootLayout() {
//   const { isAuthenticated, loadToken, checkTokenExpiration } = useAuthStore();
//   const router = useRouter();
//   const segments = useSegments();
//   const [appIsReady, setAppIsReady] = useState(false);

//   const [fontsLoaded] = useFonts({
//     Inter_700Bold,
//     Inter_400Regular,
//     Anton_400Regular,
//   });

//   useEffect(() => {
//     const prepareApp = async () => {
//       try {
//         // Carrega o token e verifica se está expirado
//         await loadToken();
        
//         if (fontsLoaded) {
//           setAppIsReady(true); // Indica que o app está pronto
//           await SplashScreen.hideAsync(); // Esconde a splash screen
//         }
//       } catch (error) {
//         console.warn('Error preparing app:', error);
//         setAppIsReady(true); // Mesmo com erro, permite o app continuar
//         await SplashScreen.hideAsync();
//       }
//     };

//     prepareApp();
//   }, [fontsLoaded, loadToken, checkTokenExpiration]);

//   // Navegação baseada no estado de autenticação
//   useEffect(() => {
//     if (appIsReady) {
//       if (!isAuthenticated && segments[0] !== 'intro') {
//         router.replace('/intro');
//       } else if (isAuthenticated && segments[0] !== 'dashboard') {
//         router.replace('/dashboard');
//       }
//     }
//   }, [isAuthenticated, appIsReady, segments, router]);

//   // Verificação periódica de expiração do token (opcional)
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const tokenCheckInterval = setInterval(async () => {
//       const isValid = await checkTokenExpiration();
//       if (!isValid) {
//         // Token expirou e usuário foi deslogado automaticamente
//         console.log('Token expired, user logged out');
//       }
//     }, 5 * 60 * 1000); // Verifica a cada 5 minutos

//     return () => clearInterval(tokenCheckInterval);
//   }, [isAuthenticated, checkTokenExpiration]);

//   // Enquanto o app não está pronto, não renderiza nada (mantém a splash screen)
//   if (!appIsReady) {
//     return null;
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <GestureHandlerRootView className="flex-1">
//         <Slot />
//       </GestureHandlerRootView>
//     </QueryClientProvider>
//   );
// }

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
