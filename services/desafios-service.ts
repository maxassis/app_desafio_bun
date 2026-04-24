import type { AllDesafios } from "../@types/desafio-get-all-desafio";
import type { BuyData } from "../@types/desafio-purchase-data";
import type { RouteResponse } from "../@types/desafio-get-desafio";
import { apiClient, getErrorMessage } from "./api-client";

// pega todos os desafios
export const fetchAllDesafios = async (): Promise<AllDesafios[]> => {
  try {
    const { data } = await apiClient.get<AllDesafios[]>(
      "/desafio/get-all-desafio"
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Network response was not ok"));
  }
};

// pega os dados da rota
export const fetchRouteData = async (
  desafioId: string | number
): Promise<RouteResponse> => {
  try {
    const { data } = await apiClient.get<RouteResponse>(
      `/desafio/${desafioId}`
    );

    if (!Array.isArray(data.location)) {
      throw new Error("Location is not a valid coordinates array");
    }

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch route data"));
  }
};

export const fetchPurchaseData = async (
  desafioId: string | number
): Promise<BuyData> => {
  try {
    const { data } = await apiClient.get<BuyData>(
      `/desafio/purchase-data/${desafioId}`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Network response was not ok"));
  }
};
