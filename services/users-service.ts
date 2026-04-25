import type { RankData } from "../@types/users-get-ranking";
import type {
  UsersEditUserdataRequest,
  UsersEditUserdataResponse,
} from "../@types/users-edit-userdata";
import type { UserData } from "../@types/users-get-user-data";
import type { UserProfile } from "../@types/users-get-user-profile";
import { apiClient, getErrorMessage } from "./api-client";

export const fetchUserData = async (): Promise<UserData> => {
  try {
    const { data } = await apiClient.get<UserData>("/users/get-user-data");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Network response was not ok"));
  }
};

// Pega os dados do rank
export const fetchRankData = async (
  desafioId: string | number
): Promise<RankData[]> => {
  try {
    const { data } = await apiClient.get<RankData[]>(
      `/users/get-ranking/${desafioId}`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch ranking data"));
  }
};

export async function getProfile(id: string) {
  try {
    const { data } = await apiClient.get<UserProfile>(
      `/users/get-user-profile/${id}`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Network response was not ok"));
  }
}

export const editUserData = async (
  payload: UsersEditUserdataRequest
): Promise<UsersEditUserdataResponse> => {
  console.log("[edit-user-data] iniciando request", {
    endpoint: "/users/edit-user-data",
    payload,
  });

  try {
    const { data, status, statusText } = await apiClient.patch<UsersEditUserdataResponse>(
      "/users/edit-user-data",
      payload
    );

    console.log("[edit-user-data] resposta recebida", {
      status,
      statusText,
      response: data,
    });

    return data;
  } catch (error: any) {
    console.error("[edit-user-data] erro na request", {
      message: error?.message,
      status: error?.response?.status,
      response: error?.response?.data,
    });

    throw new Error(getErrorMessage(error, "Erro ao salvar alterações"));
  }
};
