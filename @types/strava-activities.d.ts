export interface StravaActivity {
  id: string
  name: string
  distanceKm: number
  duration: number
  date: string
  type?: string
}

export type StravaActivitiesResponse = StravaActivity[]

export interface StravaStatusResponse {
  connected: boolean
  athleteId?: string
}
