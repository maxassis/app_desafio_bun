import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { apiClient, getErrorMessage } from './api-client'
import { authClient } from './auth-client'

WebBrowser.maybeCompleteAuthSession()

export interface StravaStatus {
  connected: boolean
  athleteId: string | null
  scopes: string | null
  expiresAt: string | null
}

interface StravaLinkResponse {
  url?: string
}

export async function fetchStravaStatus(): Promise<StravaStatus> {
  try {
    const { data } = await apiClient.get<StravaStatus>('/integrations/strava/status')
    return data
  }
  catch (error) {
    throw new Error(getErrorMessage(error, 'Erro ao buscar status do Strava'))
  }
}

export async function connectStrava() {
  const callbackURL = Linking.createURL('strava-connected')

  const { data, error } = await authClient.$fetch<StravaLinkResponse>('/oauth2/link', {
    method: 'POST',
    body: {
      providerId: 'strava',
      callbackURL,
      errorCallbackURL: `${callbackURL}?error=oauth`,
      scopes: ['read', 'activity:read_all'],
    },
  })

  if (error) {
    throw new Error(error.message || 'Erro ao gerar URL do Strava')
  }

  if (!data?.url) {
    throw new Error('URL de autenticação do Strava não retornada')
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, callbackURL)

  if (result.type !== 'success') {
    throw new Error('Login com Strava cancelado')
  }

  const parsedUrl = Linking.parse(result.url)

  if (parsedUrl.queryParams?.error) {
    throw new Error('Falha ao conectar com Strava')
  }

  return result
}

export async function disconnectStrava() {
  try {
    const { data } = await apiClient.delete<{ message: string }>('/integrations/strava')
    return data
  }
  catch (error) {
    throw new Error(getErrorMessage(error, 'Erro ao desconectar Strava'))
  }
}
