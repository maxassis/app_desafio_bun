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
import { AuthProvider, useAuth } from '@/contexts/auth-context'

SplashScreen.preventAutoHideAsync()

configureReanimatedLogger({
  strict: false,
})

const queryClient = new QueryClient()

function RootLayoutNav() {
  const router = useRouter()
  const segments = useSegments()
  const { isAuthenticated, isLoading } = useAuth()
  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Anton_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      setAppIsReady(true)
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isLoading])

  useEffect(() => {
    if (!appIsReady || isLoading)
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
  }, [isAuthenticated, isLoading, appIsReady, segments, router])

  if (!appIsReady)
    return null

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={Constants.expoConfig?.extra?.stripePublicKey}
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
