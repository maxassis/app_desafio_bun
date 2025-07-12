import { useState, useEffect, useRef, useMemo } from "react";
import { router } from "expo-router";
import {
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
import { cva } from "class-variance-authority";
import Outdoor from "../../../assets/Outdoor.svg";
import { convertSecondsToTimeStringWithSeconds } from "@/utils/timeUtils";
import dayjs from "dayjs";
import tokenExists from "../../../store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTrackerStore } from "@/store/rastreador-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "@/components/Button";
import useDesafioStore from "../../../store/desafio-store";

interface DadosTarefaGps {
  name: string;
  distance: number;
  environment: string;
  calories: number;
  inscriptionId: number;
  date: string | null;
  duration: number;
  gpsTask: boolean;
  local: string | null;
}

interface CheckCompletion {
  willCompleteChallenge: boolean
  inscriptionId: number
}

interface CreateTaskApiResponse {
  message: string;
  task: DadosTarefaGps;
}

export default function CreateTaskGps() {
  const [nomeAtividade, setNomeAtividade] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const token = tokenExists((state) => state.token);
  const queryClient = useQueryClient();
  // const { inscriptionId, desafioId } = useLocalSearchParams();
  const { distanceStore, elapsedStore, cityStore } = useTrackerStore();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetSuccessRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["33%"], []);
  const snapPointsSuccess = useMemo(() => ["33%"], []);
  const { desafioName, inscriptionId, desafioId } = useDesafioStore();

  const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);

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

  const criarTarefaMutation = useMutation<CreateTaskApiResponse, Error, CheckCompletion>({
        mutationFn: async (dadosTarefa: CheckCompletion): Promise<CreateTaskApiResponse> => {
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
    onSuccess: (data: CreateTaskApiResponse, variables: CheckCompletion) => {
      console.log("Variáveis recebidas no onSuccess:", variables);
      const metaAtingida = variables.willCompleteChallenge;

      // limparInputs();
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["getAllDesafios"] });
      queryClient.invalidateQueries({ queryKey: ["desafios"] });
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });

      if (metaAtingida) {
        router.replace("/dashboard");
      } else {
        router.replace("/taskCreatedSuccess");
      }
    },
    onError: (erro) => {
      console.error("Erro ao criar tarefa:", erro);
      setIsLoading(false);
    },
  });

  const verificarConclusaoDesafioMutation = useMutation<CheckCompletion, Error, void>({
    mutationFn: async (): Promise<CheckCompletion> => {
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/tasks/check-completion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inscriptionId: inscriptionId,
            distance: +distanceStore,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao verificar conclusão do desafio");
      }

      return response.json();
    },
    onSuccess: (data: CheckCompletion) => {
      if (data.willCompleteChallenge) {
        setIsLoading(false);
        bottomSheetSuccessRef.current?.expand();
      } else {
        criarTarefa(false);
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
      if (isSuccessSheetOpen) {
        bottomSheetSuccessRef.current?.close();
        return true;
      }
      confirmarDescarte();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isSuccessSheetOpen]);

  function confirmarDescarte() {
    bottomSheetRef.current?.expand();
  }

  function criarTarefa(checkCompletion: boolean) {
    const distanceFormated = (d: number): number => {
      const num = d.toFixed(3);
      return +num;
    };

    const dadosTarefa: DadosTarefaGps = {
      name: nomeAtividade,
      distance: distanceFormated(+distanceStore),
      environment: "livre",
      calories: 200,
      inscriptionId: inscriptionId as number,
      date: getFormattedCurrentUtcDate(),
      duration: +elapsedStore,
      gpsTask: true,
      local: cityStore ?? "",
    };

    criarTarefaMutation.mutate({...dadosTarefa, willCompleteChallenge: checkCompletion});
  }

  function verificarConclusao() {
    setIsLoading(true);
    verificarConclusaoDesafioMutation.mutate();
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
          <Text className="text-bondis-gray-dark p-4">{cityStore ?? ""}</Text>
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

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        // onChange={handleSheetChanges}
      >
        <BottomSheetView className="flex-1 z-50">
          <Text className="font-inter-bold text-base mx-5 mb-4 text-center mt-[26px]">
            Deseja descartar esta atividade?
          </Text>
          <Text className="text-center">
            Todo o progresso será perdido e não poderá ser recuperado.
          </Text>

          <TouchableOpacity
            className="mt-4"
            onPress={() => {
              bottomSheetRef.current?.close();
              router.dismissAll();
              router.replace("/dashboard");
            }}
          >
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400 mx-5">
              <Text className="text-bondis-alert-red text-base font-inter-bold ">
                Descartar atividade
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <View className="h-[51px] justify-center items-center">
              <Text className="text-base mx-auto font-inter-bold">
                Voltar
              </Text>
            </View>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetSuccessRef}
        snapPoints={snapPointsSuccess}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={(index) => setIsSuccessSheetOpen(index !== -1)}
      >
        <BottomSheetView className="flex-1 z-50">
          <View className="mx-5">
            <Text className="font-inter-bold text-center text-base mt-4">Deseja concluir seu desafio?</Text>

            <Text className="mt-2 text-center">Esta atividade completa o desafio <Text className="font-inter-bold">{desafioName}</Text>. Após concluir, não será mais possível editar ou adicionar 
              novas atividades. 
            </Text>

            <Button title="Sim, concluir atividade" onPress={() => criarTarefa(true)} />

            <TouchableOpacity  className="items-center justify-center h-[52px]" onPress={() => bottomSheetSuccessRef.current?.close()}>
              <Text className="text-center font-inter-bold">Voltar</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
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
