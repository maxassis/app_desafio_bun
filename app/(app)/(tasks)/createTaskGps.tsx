import { useState } from "react";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Close from "../../../assets/Close.svg";
import { cva } from "class-variance-authority";
import Outdoor from "../../../assets/Outdoor.svg";
import { useLocalSearchParams } from "expo-router";
import { convertSecondsToTimeStringWithSeconds } from "@/utils/timeUtils";
import dayjs from "dayjs";
import tokenExists from "../../../store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DadosTarefaGps {
  name: string;
  distance: number;
  environment: string;
  calories: number;
  inscriptionId: number;
  date: string | null;
  duration: number;
  gpsTask: boolean;
}

interface CheckCompletion {
  inscriptionId: number;
  distance: number;
}

export default function CreateTaskGps() {
  const [nomeAtividade, setNomeAtividade] = useState("");
  const { city, elapsed, distance } = useLocalSearchParams();
  const token = tokenExists((state) => state.token);
  const queryClient = useQueryClient();

  function converterKmParaString(km: number): string {
    const kmAbsoluto: number = Math.abs(km);

    const quilometrosInteiros: number = Math.floor(kmAbsoluto);
    const metros: number = Math.round(
      (kmAbsoluto - quilometrosInteiros) * 1000
    );

    const kmFormatado: string = String(quilometrosInteiros);

    const metrosFormatado: string = String(metros);

    return `${kmFormatado}km ${metrosFormatado}m`;
  }

  function getFormattedCurrentUtcDate(): string {
    const agoraUtc = dayjs().utc();

    const dataFormatada = agoraUtc.format("YYYY-MM-DDTHH:mm:ss[Z]");

    return dataFormatada;
  }

  function getFormattedCurrentDateDDMMYYYY(): string {
    const agora = dayjs();

    const dataFormatada = agora.format("DD/MM/YYYY");

    return dataFormatada;
  }

     const criarTarefaMutation = useMutation({
        mutationFn: async (dadosTarefa: CheckCompletion) => {
          const response = await fetch("http://10.0.2.2:3000/tasks/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dadosTarefa),
          });
          if (!response.ok) {
            const dadosErro = await response.json();
            throw new Error(dadosErro.message || "Falha ao criar tarefa");
          }
          return response.json();
        },
        onSuccess: (data) => {
          // limparInputs();
          queryClient.refetchQueries({ queryKey: ["getAllDesafios"] });
          queryClient.invalidateQueries({ queryKey: ["desafios"] });
          queryClient.invalidateQueries({ queryKey: ["routeData", 1] });  //desafioId
          queryClient.invalidateQueries({ queryKey: ["rankData", 1] });  //desafioId
    
          const metaAtingida = data.challengeCompleted;
    
          if (metaAtingida) {
            router.push({
              pathname: "/dashboard",
            });
          } else {
            router.push({
              pathname: "/taskList",
            });
          }
        },
        onError: (erro) => {
          console.error("Erro ao criar tarefa:", erro);
        },
      });



    const verificarConclusaoDesafioMutation = useMutation({
    mutationFn: async () => {
      // const distanciaSelecionada = +`${distancia.kilometers}.${distancia.meters}`;

      const response = await fetch(
        "http://10.0.2.2:3000/tasks/check-completion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inscriptionId: 1,
            distance: +distance,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao verificar conclusão do desafio");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.willCompleteChallenge) {
        Alert.alert(
          "Atenção",
          "Ao adicionar esta tarefa, você concluirá o desafio. Uma vez concluído, não será mais possível adicionar nem alterar mais tarefas.",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Concluir",
              onPress: () => {
                criarTarefa();
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        criarTarefa();
      }
    },
    onError: (erro) => {
      console.error("Erro ao verificar conclusão do desafio:", erro);
      Alert.alert(
        "Erro",
        "Não foi possível verificar se o desafio será concluído. Tente novamente."
      );
    },
  });


   function criarTarefa() {
      // const distanciaSelecionada = +`${distancia.kilometers}.${distancia.meters}`;

      const distanceFormated = (d: number): number => {
        const num = d.toFixed(3)
        return +num
      }
  
      const dadosTarefa: DadosTarefaGps = {
        name: nomeAtividade,
        distance: distanceFormated(+distance),
        environment: "livre",
        calories: 200,
        inscriptionId: 1, // inscriptionId
        date: getFormattedCurrentUtcDate() ,
        duration: +elapsed,
        gpsTask: true
      };
  
      criarTarefaMutation.mutate(dadosTarefa);
    }



  function verificarConclusao() {
    verificarConclusaoDesafioMutation.mutate();
  }




  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView className="flex-1">
        <View className="mb-[10px] pt-[38px] mx-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Close />
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-anton-regular mt-7 mx-5">
          Como foi a sua atividade? {distance}
        </Text>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Nome da atividade
        </Text>

        <TextInput
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4 mx-5"
          value={nomeAtividade}
          onChangeText={setNomeAtividade}
        />

        {nomeAtividade.length === 0 && (
          <Text className="mt-1 text-bondis-alert-red mx-5">
            Campo obrigatório
          </Text>
        )}

        <Text className="font-inter-bold mt-7 text-base mx-5">Ambiente</Text>
        <View className="flex-row mt-4 ml-6">
          <LinearGradient
            colors={["rgba(178, 255, 115, 0.322)", "#12FF55"]}
            className={
              "border-0 h-[37px] rounded-full justify-center items-center flex-row gap-x-[8px] border-[#D9D9D9] pr-4 pl-2"
            }
          >
            <Outdoor />
            <Text>Ao ar livre</Text>
          </LinearGradient>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Data</Text>

        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">
            {getFormattedCurrentDateDDMMYYYY()}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Duração da atividade
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">
            {convertSecondsToTimeStringWithSeconds(+elapsed)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Distância percorrida
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">
            {converterKmParaString(+distance)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Calorias queimadas
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4"></Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Local</Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">{city}</Text>
        </View>

        <TouchableOpacity className="mt-[48px] mb-[24px]">
          <Text className="text-bondis-alert-red text-base mx-auto font-inter-bold">
            Descartar atividade
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={verificarConclusao} className={botaoDesabilitado()}>
          <Text className="font-inter-bold text-base">Cadastra atividade</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const botaoDesabilitado = cva(
  "h-[52px] flex-row bg-bondis-green mt-8 mb-[32px] rounded-full justify-center items-center mx-5",
  {
    variants: {
      intent: {
        disabled: "opacity-50",
      },
    },
  }
);


