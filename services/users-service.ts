import type { RankData } from "../@types/users-get-ranking";
import type { UserData } from "../@types/users-get-user-data";
import type { UserProfile } from "../@types/users-get-user-profile";
import type { UsersChangePasswordRequest, UsersChangePasswordResponse } from "../@types/users-change-password";
import type { UsersCreateRequest, UsersCreateResponse } from "../@types/users-create";
import type { UsersDeleteAvatarRequest, UsersDeleteAvatarResponse } from "../@types/users-delete-avatar";
import type { UsersEditUserdataRequest, UsersEditUserdataResponse } from "../@types/users-edit-userdata";
import type { UsersUploadAvatarRequest, UsersUploadAvatarResponse } from "../@types/users-upload-avatar";
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

export const createUser = async (
  payload: UsersCreateRequest
): Promise<UsersCreateResponse> => {
  try {
    const { data } = await apiClient.post<UsersCreateResponse>("/users", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao criar usuário"));
  }
};

export const changePassword = async (
  payload: UsersChangePasswordRequest
): Promise<UsersChangePasswordResponse> => {
  try {
    const { data } = await apiClient.patch<UsersChangePasswordResponse>(
      "/users/change-password",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao alterar senha"));
  }
};

export const editUserData = async (
  payload: UsersEditUserdataRequest
): Promise<UsersEditUserdataResponse> => {
  try {
    const { data } = await apiClient.patch<UsersEditUserdataResponse>(
      "/users/edit-userdata",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao atualizar perfil"));
  }
};

export const uploadAvatar = async (
  payload: UsersUploadAvatarRequest
): Promise<UsersUploadAvatarResponse> => {
  try {
    const { data } = await apiClient.post<UsersUploadAvatarResponse>(
      "/users/upload-avatar",
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao enviar imagem"));
  }
};

export const deleteAvatar = async (
  payload: UsersDeleteAvatarRequest
): Promise<UsersDeleteAvatarResponse> => {
  try {
    const { data } = await apiClient.delete<UsersDeleteAvatarResponse>(
      "/users/delete-avatar",
      { data: payload }
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao remover imagem"));
  }
};
