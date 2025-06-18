import useAuthStore from "../store/auth-store";

type Coordinate = {
  latitude: number;
  longitude: number;
};
export interface UserData {
  id: string;
  avatar_url: string | null;
  avatar_filename: string | null;
  full_name: string | null;
  bio: string | null;
  gender: string | null;
  sport: string | null;
  createdAt: Date;
  usersId: string;
  username: string;
  birthDate: string | null
}

export interface AllDesafios {
  id: number;
  name: string;
  description: string;
  distance: string;
  isRegistered: boolean;
  completed: boolean;
  completedAt: null | Date;
  progressPercentage: number;
  totalDistanceCompleted: number;
  photo: string;
  tasksCount: number,
  totalDuration: number
  inscriptionId: number
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
  totalTasks: number,
  totalCalories: number,
  totalDistanceKm: number
}

export interface User {
  id: string;
  name: string;
  UserData: UserData | null;
}

export interface RankData {
  position: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalDistance: number;
  totalDurationSeconds: number;
  avgSpeed: number;
}

export type DesafioData = Data[];

export interface Data {
  id: number;
  userId: string;
  desafioId: number;
  progress: string;
  completed: boolean;
  desafio: Desafio;
  isRegistered: boolean,
}

export interface Desafio {
  id: number;
  name: string;
  description: string;
  distance: number;
  photo: string;
}

interface BuyData {
  name: string;
  backgroundPhoto: string;
  photos: string[];
  shortDescription: string;
  description: string;
  trackPhoto: string;
  howParticipate: string;
  price: string;
  benefits: string[];
  rules: string[];
}

// API base URL
// const API_BASE_URL = "https://bondis-app-backend.onrender.com";
const API_BASE_URL = "http://10.0.2.2:3000"

// Get auth token from store
const getToken = () => {
  return useAuthStore.getState().token;
};

const token = getToken();


// pegas os dados do usuário
export const fetchUserData = async (): Promise<UserData> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/users/get-user-data`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

// pega todos os desafios
export const fetchAllDesafios = async (): Promise<AllDesafios[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/desafio/get-all-desafio`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

// pega os dados da rota
export const fetchRouteData = async (
  desafioId: string | number
): Promise<RouteResponse> => {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/desafio/get-desafio/${desafioId}`,
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route data");
  }

  const data: RouteResponse = await response.json();

  if (!Array.isArray(data.location)) {
    throw new Error("Location is not a valid coordinates array");
  }

  return data;
};


// Pega os dados do rank
export const fetchRankData = async (desafioId: string | number): Promise<RankData[]> => {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/users/get-ranking/${desafioId}`,
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};


export const fetchPurchaseData = async (desafioId: string | number): Promise<BuyData> => {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/desafio/purchase-data/${desafioId}`,
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return {} as BuyData; // Return an empty object as a default value
  }
};


// Pedos desafios de um usuario
// export async function fetchDesafios(token: string): Promise<DesafioData> {
//   const response = await fetch("https://bondis-app-backend.onrender.com/desafio/get-user-desafio/", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch desafios");
//   }

//   return response.json();
// }

