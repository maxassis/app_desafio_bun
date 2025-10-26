import { useState } from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserData } from "@/utils/api-service";
import { useRouter } from "expo-router";

const AcceptDesafioButton = ({
  desafioId,
  price,
}: {
  desafioId: string;
  price: string;
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showBtn, setShowBtn] = useState(false);

  const valor = price;
  const valorFloat = parseFloat(valor.replace(",", "."));
  const valorCentavos = Math.round(valorFloat * 100);

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/payments/payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: valorCentavos,
            currency: "brl",
            userId: userData?.usersId,
            desafioId: desafioId,
          }),
        }
      );
      const data = await response.json();
      if (!data.clientSecret) {
        throw new Error("Resposta inválida do servidor");
      }
      return data.clientSecret;
    },
    onSuccess: async (clientSecret) => {
      const init = await initPaymentSheet({
        merchantDisplayName: "Seu App",
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (init.error) {
        throw new Error("Erro ao inicializar PaymentSheet: " + init.error.message);
      }

      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        throw new Error("Pagamento foi cancelado");
      } else {
        setShowBtn(true);
        queryClient.clear();
        // router.replace("/(app)/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Erro no pagamento:", error);
      alert("Erro ao processar o pagamento. Tente novamente.");
    },
  });

  return (
    <TouchableOpacity
      onPress={() => mutation.mutate()}
      className={`h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5 ${showBtn ? "hidden" : ""}`}
      disabled={mutation.isPending || showBtn}
    >
      {mutation.isPending ? (
        <ActivityIndicator color="black" />
      ) : (
        <Text className="text-center font-inter-bold text-base text-black">
          Aceito o desafio 💪
        </Text>
      )}
    </TouchableOpacity>
  );
};

export  { AcceptDesafioButton }
