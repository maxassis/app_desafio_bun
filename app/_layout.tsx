import { Anton_400Regular } from '@expo-google-fonts/anton'
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import { StripeProvider } from '@stripe/stripe-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { configureReanimatedLogger } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/utils/toastConfig'
import useAuthStore from '../store/auth-store'

SplashScreen.preventAutoHideAsync()

configureReanimatedLogger({
  strict: false,
})

const queryClient = new QueryClient()

export default function RootLayout() {
  const { isAuthenticated, loadSession, checkSessionExpiration } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()

  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Anton_400Regular,
  })

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await loadSession()
      }
      catch (e) {
        console.warn('Erro ao carregar sessao:', e)
      }
      finally {
        if (fontsLoaded) {
          setAppIsReady(true)
          await SplashScreen.hideAsync()
        }
      }
    }

    if (fontsLoaded) {
      prepareApp()
    }
  }, [fontsLoaded, loadSession])

  // useEffect(() => {
  //   if (appIsReady) {
  //     NavigationBar.setButtonStyleAsync('dark');
  //     NavigationBar.setBackgroundColorAsync('transparent');
  //   }
  // }, [appIsReady]);

  // Navegação baseada na autenticação
  useEffect(() => {
    if (!appIsReady)
      return

    const currentGroup = segments[0]

    if (!isAuthenticated) {
      if (currentGroup !== '(auth)') {
        router.replace('/(auth)/intro')
      }
    }
    else {
      if (currentGroup !== '(app)') {
        router.replace('/(app)/dashboard')
      }
    }
  }, [isAuthenticated, appIsReady, segments, router])

  // Verificacao periodica da sessao
  useEffect(() => {
    if (!isAuthenticated)
      return

    const interval = setInterval(async () => {
      const isValid = await checkSessionExpiration()
      if (!isValid) {
        console.error('Sessao expirada, deslogando...')
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, checkSessionExpiration])

  if (!appIsReady)
    return null

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={Constants.expoConfig?.extra?.stripePublicKey}
        // merchantIdentifier="merchant.com.seuapp.id"     // apenas necessário no iOS Apple Pay
      >
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Slot />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </StripeProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  )
}
