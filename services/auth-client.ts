import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'
import type { AuthAccessTokenResponse, AuthTokenResponse } from '../@types/auth-signin'
import { API_BASE_URL } from './api-client'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'meudesafio2',
      storage: SecureStore,
    }),
  ],
})

export const getAuthAccessToken = async (): Promise<AuthAccessTokenResponse> => {
  const response = await authClient.$fetch<AuthTokenResponse>('/token')

  if (response.error) {
    throw new Error(response.error.message || 'Erro ao obter token de acesso')
  }

  return {
    access_token: response.data.token,
  }
}
