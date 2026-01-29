import axios from "axios";
import type { AuthSigninRequest, AuthSigninResponse } from "../@types/auth-signin";
import type { CheckEmailRequest, CheckEmailResponse } from "../@types/check-email";
import type { ConfirmCodeRequest, ConfirmCodeResponse } from "../@types/confirm-code";
import type { SendEmailRequest, SendEmailResponse } from "../@types/send-email";
import type {
  SendMailRecoveryRequest,
  SendMailRecoveryResponse,
} from "../@types/send-mail-recovery";
import { apiClient, getErrorMessage } from "./api-client";

export const signIn = async (
  payload: AuthSigninRequest
): Promise<AuthSigninResponse> => {
  try {
    const { data } = await apiClient.post<AuthSigninResponse>(
      "/signin",
      payload
    );
    return data;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    const err = new Error(getErrorMessage(error, "Erro ao fazer login"));
    (err as any).status = status;
    throw err;
  }
};

export const checkEmail = async (
  payload: CheckEmailRequest
): Promise<number> => {
  const response = await apiClient.post<CheckEmailResponse>(
    "/check-email",
    payload,
    {
      validateStatus: () => true,
    }
  );
  return response.status;
};

export const sendEmail = async (
  payload: SendEmailRequest
): Promise<SendEmailResponse> => {
  try {
    const { data } = await apiClient.post<SendEmailResponse>(
      "/send-email",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao enviar e-mail"));
  }
};

export const sendMailRecovery = async (
  payload: SendMailRecoveryRequest
): Promise<SendMailRecoveryResponse> => {
  try {
    const { data } = await apiClient.post<SendMailRecoveryResponse>(
      "/send-mail-recovery",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao enviar e-mail"));
  }
};

export const confirmCode = async (
  payload: ConfirmCodeRequest
): Promise<ConfirmCodeResponse> => {
  try {
    const { data } = await apiClient.post<ConfirmCodeResponse>(
      "/confirm-code",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Código inválido"));
  }
};
