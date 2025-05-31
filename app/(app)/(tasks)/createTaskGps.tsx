import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  BackHandler,
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
import { useTrackerStore } from "@/store/rastreador-store";

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
  const [isLoading, setIsLoading] = useState(false);
  const token = tokenExists((state) => state.token);
  const queryClient = useQueryClient();
  const { inscriptionId, desafioId } = useLocalSearchParams();
  const { distanceStore, elapsedStore, cityStore } = useTrackerStore();

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
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/tasks/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosTarefa),
        }
      );
      if (!response.ok) {
        const dadosErro = await response.json();
        throw new Error(dadosErro.message || "Falha ao criar tarefa");
      }
      return response.json();
    },
    onSuccess: (data: { challengeCompleted: boolean }) => {
      // limparInputs();
      setIsLoading(false);
      queryClient.refetchQueries({ queryKey: ["getAllDesafios"] });
      queryClient.invalidateQueries({ queryKey: ["desafios"] });
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });

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
      setIsLoading(false);
    },
  });

  const verificarConclusaoDesafioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/tasks/check-completion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inscriptionId: +inscriptionId,
            distance: +distanceStore,
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
        setIsLoading(false);
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
                setIsLoading(true);
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
      setIsLoading(false);
      Alert.alert(
        "Erro",
        "Não foi possível verificar se o desafio será concluído. Tente novamente."
      );
    },
  });

  useEffect(() => {
    const backAction = () => {
      confirmarDescarte();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  function confirmarDescarte() {
    Alert.alert(
      "Descartar atividade",
      "Tem certeza que deseja descartar sua atividade?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          style: "destructive",
          onPress: () => {
            router.push("/dashboard");
          },
        },
      ],
      { cancelable: true }
    );
  }

  function criarTarefa() {
    const distanceFormated = (d: number): number => {
      const num = d.toFixed(3);
      return +num;
    };

    const dadosTarefa: DadosTarefaGps = {
      name: nomeAtividade,
      distance: distanceFormated(+distanceStore),
      environment: "livre",
      calories: 200,
      inscriptionId: +inscriptionId,
      date: getFormattedCurrentUtcDate(),
      duration: +elapsedStore,
      gpsTask: true,
    };

    criarTarefaMutation.mutate(dadosTarefa);
  }

  function verificarConclusao() {
    console.log("apertou verificar conclusao");
    setIsLoading(true);
    verificarConclusaoDesafioMutation.mutate();
  }

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView overScrollMode="never" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-anton-regular mt-[38px] mx-5">
          Como foi a sua atividade?
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
          <Text className="text-bondis-gray-dark p-4">
            {convertSecondsToTimeStringWithSeconds(+elapsedStore)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Distância percorrida
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">
            {converterKmParaString(+distanceStore)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Calorias queimadas
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4"></Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Local</Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">{cityStore}</Text>
        </View>

        <TouchableOpacity
          className="mt-[48px] mb-[24px]"
          onPress={confirmarDescarte}
        >
          <Text className="text-bondis-alert-red text-base mx-auto font-inter-bold">
            Descartar atividade
          </Text>
        </TouchableOpacity>

        <Pressable
          onPress={verificarConclusao}
          className={botaoDesabilitado({
            intent: nomeAtividade.length === 0 || isLoading ? "disabled" : null,
          })}
          disabled={nomeAtividade.length === 0 || isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-x-2">
              <Text className="font-inter-bold text-base">Carregando...</Text>
              <ActivityIndicator color="#000000" />
            </View>
          ) : (
            <Text className="font-inter-bold text-base">
              Cadastrar atividade
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const botaoDesabilitado = cva(
  "h-[52px] flex-row bg-bondis-green mt-8 mb-[32px] rounded-full justify-center items-center mx-5",
  {
    variants: {
      intent: {
        disabled: "opacity-50 pointer-events-none",
      },
    },
  }
);
