import { useState } from "react";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Close from "../../../assets/Close.svg";
import { cva } from "class-variance-authority";
import Outdoor from "../../../assets/Outdoor.svg";

export default function CreateTaskGps() {
  const [nomeAtividade, setNomeAtividade] = useState("");

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
          <Text className="text-dark-gray p-4">Selecione</Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Duração da atividade
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">Selecione</Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Distância percorrida
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">Selecione</Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">
          Calorias queimadas
        </Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">Selecione</Text>
        </View>

        <Text className="font-inter-bold text-base mt-7 mx-5">Local</Text>
        <View className="mx-5 bg-bondis-text-gray h-[52px] mt-2 rounded-[4px]">
          <Text className="text-dark-gray p-4">Rio de Janeiro</Text>
        </View>

        <TouchableOpacity className="mt-[48px] mb-[24px]">
          <Text className="text-bondis-alert-red text-base mx-auto font-inter-bold">Descartar atividade</Text>
        </TouchableOpacity>

        <TouchableOpacity className={botaoDesabilitado()}>
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
