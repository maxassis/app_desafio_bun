import axios from "axios";
import type {
  AuthSigninRequest,
  AuthSigninResponse,
  AuthTokenResponse,
  AuthAccessTokenResponse,
} from "../@types/auth-signin";
import { API_BASE_URL, getErrorMessage } from "./api-client";

const AUTH_SIGN_IN_URL = `${API_BASE_URL}/api/auth/sign-in/email`;
const AUTH_TOKEN_URL = `${API_BASE_URL}/api/auth/token`;
const AUTH_ORIGIN = API_BASE_URL;
console.log(API_BASE_URL)

export const signIn = async (
  payload: AuthSigninRequest
): Promise<AuthSigninResponse> => {
  try {
    const { data } = await axios.post<AuthSigninResponse>(
      AUTH_SIGN_IN_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Origin: AUTH_ORIGIN,
        },
      }
    );

    return data;
  } catch (error) {
    const authError = new Error(getErrorMessage(error, "Erro ao fazer login")) as Error & {
      status?: number;
    };

    if (axios.isAxiosError(error)) {
      authError.status = error.response?.status;
    }

    throw authError;
  }
};

export const exchangeAuthToken = async (
  token: string
): Promise<AuthAccessTokenResponse> => {
  try {
    const { data } = await axios.get<AuthTokenResponse>(AUTH_TOKEN_URL, {
      headers: {
        "Content-Type": "application/json",
        Origin: AUTH_ORIGIN,
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      access_token: data.token,
    };
  } catch (error) {
    const authError = new Error(
      getErrorMessage(error, "Erro ao obter token de acesso")
    ) as Error & {
      status?: number;
    };

    if (axios.isAxiosError(error)) {
      authError.status = error.response?.status;
    }

    throw authError;
  }
};
