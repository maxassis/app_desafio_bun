import { useEffect, useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cva } from "class-variance-authority";
import Outdoor from "../../../assets/Outdoor.svg";
import { useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import tokenExists from "../../../store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useDesafioStore from "../../../store/desafio-store";
import Left from "../../../assets/Icon-left.svg";

export default function CreateTaskGps() {
  const [nomeAtividade, setNomeAtividade] = useState("");
  const token = tokenExists((state) => state.token);
  const queryClient = useQueryClient();
  const { desafioId } = useLocalSearchParams();
  const { taskData } = useDesafioStore();

  useEffect(() => {
    if (taskData) {
      setNomeAtividade(taskData.name);
    }
  }, [taskData]);

  function converterKmParaString(km: number): string {
    const kmAbsoluto = Math.abs(km);
    const quilometrosInteiros = Math.floor(kmAbsoluto);
    const metros = Math.round((kmAbsoluto - quilometrosInteiros) * 1000);
    return `${quilometrosInteiros}km ${metros}m`;
  }

  function formatDate(isoDate: string | Date): string {
    const date = dayjs(isoDate).utc();
    return date.format("DD/MM/YYYY");
  }

  function convertSecondsToTimeString(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Payload enviado:", {
        name: nomeAtividade,
        environment: taskData?.environment,
        distanceKm: taskData ? +taskData.distanceKm : 0,
        date: taskData?.date,
        duration: taskData?.duration,
      });

      const response = await fetch(
        `https://bondis-app-backend.onrender.com/tasks/update-task/${taskData?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: nomeAtividade,
            environment: taskData?.environment,
            distanceKm: taskData ? +taskData.distanceKm : 0,
            date: taskData?.date,
            duration: taskData?.duration ? +taskData.duration : 0,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desafios"] });
      queryClient.refetchQueries({ queryKey: ["getAllDesafios"] });
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });

      router.back();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  function editRequest() {
    console.log("edit");
    if (nomeAtividade.trim().length === 0) {
      Alert.alert("Erro", "O nome da atividade é obrigatório.");
      return;
    }
    mutation.mutate();
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView overScrollMode="never" keyboardShouldPersistTaps="handled">
        <View className="flex-row items-end h-[86px] pb-[14px] px-5">
          <TouchableOpacity onPress={() => router.back()}>
            <Left />
          </TouchableOpacity>
          <Text className="text-base font-inter-bold mx-auto">
            Editar atividade
          </Text>
        </View>

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
            className="border-0 h-[37px] rounded-full justify-center items-center flex-row gap-x-[8px] border-[#D9D9D9] pr-4 pl-2"
          >
            <Outdoor />
            <Text>Ao ar livre</Text>
          </LinearGradient>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Data</Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">
            {taskData && formatDate(taskData.date!)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Duração da atividade
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">
            {taskData && convertSecondsToTimeString(taskData.duration)}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Distância percorrida
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">
            {taskData && taskData.distanceKm !== undefined
              ? converterKmParaString(+taskData.distanceKm)
              : "0km"}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Calorias queimadas
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">
            {taskData?.calories}
          </Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Local</Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-bondis-gray-dark p-4">{taskData?.local}</Text>
        </View>

        <Pressable
          onPress={editRequest}
          className={botaoDesabilitado({
            intent:
              nomeAtividade.length === 0 || mutation.isPending  ? "disabled" : null,
          })}
          disabled={nomeAtividade.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? (
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
