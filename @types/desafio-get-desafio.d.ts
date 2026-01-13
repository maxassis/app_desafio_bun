import type { UserData } from "./users-get-user-data";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  id: string;
  name: string;
  description: string;
  location: Coordinate[];
  distance: string;
  inscription: Inscription[];
}

export interface Inscription {
  lastTaskDate: Date;
  user: User;
  progress: number;
  totalTasks: number;
  totalCalories: number;
  totalDistanceKm: number;
}

export interface User {
  id: string;
  name: string;
  UserData: UserData | null;
}

export interface DesafioGetDesafioParams {
  desafioId: string | number;
}

export type DesafioGetDesafioResponse = RouteResponse;
