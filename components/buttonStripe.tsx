import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserData } from "@/utils/api-service";

const AceitarDesafioButton = ({
  desafioId,
  price,
}: {
  desafioId: number;
  price: string;
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const queryClient = useQueryClient();

  const valor = price;
  const valorFloat = parseFloat(valor.replace(",", "."));
  const valorCentavos = Math.round(valorFloat * 100);
  // console.log(valorCentavos); // Saída: 5000

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "http://10.0.2.2:3000/payments/payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: valorCentavos,
            currency: "brl",
            userId: userData?.usersId,
            desafioId: String(desafioId),
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
        console.error("Erro ao inicializar PaymentSheet:", init.error.message);
        return;
      }

      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        alert("Pagamento foi cancelado");
      } else {
        alert("Pagamento realizado com sucesso!");
        // Ação após pagamento aqui
        queryClient.invalidateQueries({ queryKey: ["getAllDesafios"] });
        queryClient.invalidateQueries({ queryKey: ["desafios"] });
        queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
        queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });
      }
    },
    onError: (error) => {
      console.error("Erro no pagamento:", error);
      alert("Erro ao processar o pagamento. Tente novamente.");
    },
  });

  return (
    <TouchableOpacity
      onPress={() => mutation.mutate()}
      className="h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5"
      disabled={mutation.isPending}
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

export default AceitarDesafioButton;
