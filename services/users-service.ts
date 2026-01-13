import type { RankData } from "../@types/users-get-ranking";
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
    throw new Error(getErrorMessage(error, "Network response was not ok"));
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
