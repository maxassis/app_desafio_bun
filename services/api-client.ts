import axios from "axios";
import Constants from "expo-constants";
import useAuthStore from "../store/auth-store";

export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl;

const getToken = () => useAuthStore.getState().token;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const { authClient } = await import("./auth-client");
    const cookie = authClient.getCookie();

    if (cookie) {
      config.headers.Cookie = cookie;
    }
  } catch (error) {
    console.log("[API] Erro ao recuperar cookie do Better Auth:", error);
  }

  return config;
});

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
};
