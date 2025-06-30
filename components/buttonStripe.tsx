// import React from "react";
// import { Text, TouchableOpacity } from "react-native";
// import { useStripe } from "@stripe/stripe-react-native";

// const AceitarDesafioButton = ({ desafioId }: { desafioId: string }) => {
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const handleBuy = async () => {
//     try {
//       // 1. Solicita o clientSecret do backend
//       const response = await fetch(
//         "http://10.0.2.2:3000/payments/payment-intent",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             amount: 1000,
//             currency: "brl",
//             userId: "user-123",
//             desafioId: 23,
//           }),
//         }
//       );

//       const data = await response.json();
//       const { clientSecret } = data;

//       if (!clientSecret) {
//         throw new Error("Resposta inválida do servidor");
//       }

//       // 2. Inicializa o PaymentSheet
//       const init = await initPaymentSheet({
//         merchantDisplayName: "Seu App",
//         paymentIntentClientSecret: clientSecret,
//         allowsDelayedPaymentMethods: true,
//       });

//       if (init.error) {
//         console.error("Erro ao inicializar PaymentSheet:", init.error.message);
//         return;
//       }

//       // 3. Apresenta o PaymentSheet
//       const paymentResult = await presentPaymentSheet();

//       if (paymentResult.error) {
//         alert(`Pagamento foi cancelado`);
//       } else {
//         alert("Pagamento realizado com sucesso!");
//         // Ação após pagamento aqui
//       }
//     } catch (error) {
//       console.error("Erro no pagamento:", error);
//       alert("Erro ao processar o pagamento. Tente novamente.");
//     }
//   };

//   return (
//     <TouchableOpacity
//       onPress={handleBuy}
//       className="h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5"
//     >
//       <Text className="text-center font-inter-bold text-base text-black">
//         Aceito o desafio 💪
//       </Text>
//     </TouchableOpacity>
//   );
// };

// export default AceitarDesafioButton;


import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useMutation } from "@tanstack/react-query";

const AceitarDesafioButton = ({ desafioId }: { desafioId: string }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://10.0.2.2:3000/payments/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1000,
          currency: "brl",
          userId: "user-123",
          desafioId: 23,
        }),
      });

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
