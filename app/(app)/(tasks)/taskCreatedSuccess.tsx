import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import useDesafioStore from "../../../store/desafio-store";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDesafios } from "@/utils/api-service";
import * as Progress from "react-native-progress";
import { router } from "expo-router";

export default function TaskCreatedSuccess() {
  const { desafioId } = useDesafioStore();

  const {
    data: allDesafios,
    isLoading: isDesafiosLoading,
    isError: isDesafiosError,
  } = useQuery({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
  });

  const currentDesafio = allDesafios?.find(
    (desafio) => desafio.id === desafioId
  );
  
  const totalDistance = currentDesafio?.distance;
  const userProgress = currentDesafio?.progressPercentage;
  const userDistance = currentDesafio?.totalDistanceCompleted;
  const desafioName = currentDesafio?.name;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5">
        <Image
          className="w-[62px] h-[62px] mt-[204px] mx-auto"
          contentFit="cover"
          source={require("../../../assets/palmas.png")}
        />

        <Text className="font-anton-regular text-2xl text-center mt-5">
          Mandou bem
        </Text>

        <Text className="text-bondis-gray-dark mt-10 mb-8 text- text-center px-1">
          Você completou <Text className="font-inter-bold">{userDistance}km</Text> e com isso conquistou <Text className="font-inter-bold">{Math.trunc(userProgress ?? 0)}%</Text> do desafio: {desafioName}. Continue assim!
        </Text>

        <Progress.Bar
          progress={userDistance && totalDistance != null ? userDistance / +totalDistance : undefined}
          width={null}
          height={8}
          color="#12FF55"
          unfilledColor="#565656"
          borderColor="transparent"
          borderWidth={0}
        />

        <Text className="font-inter-bold text-base mt-2">{userDistance} de {Number(totalDistance ?? 0).toFixed(3)}km</Text>

         <TouchableOpacity
          className="h-[52px] flex-row bg-bondis-green mt-12 rounded-full justify-center items-center"
        >
          <Text className="font-inter-bold text-base">Compartilhar</Text>
        </TouchableOpacity>

         <TouchableOpacity onPress={() => router.replace("/taskList")} className="w-[120px] items-center mx-auto"> 
          <Text className="font-inter-bold text-base mt-8 underline">Ver atividade</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
