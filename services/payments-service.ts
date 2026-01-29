import type {
  PaymentsPaymentIntentRequest,
  PaymentsPaymentIntentResponse,
} from "../@types/payments-payment-intent";
import { apiClient, getErrorMessage } from "./api-client";

export const createPaymentIntent = async (
  payload: PaymentsPaymentIntentRequest
): Promise<PaymentsPaymentIntentResponse> => {
  try {
    const { data } = await apiClient.post<PaymentsPaymentIntentResponse>(
      "/payments/payment-intent",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Erro ao iniciar pagamento"));
  }
};
