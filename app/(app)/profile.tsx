import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/utils/api-service";
import { Image } from "expo-image";
import * as Progress from "react-native-progress";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import Rigth from "../../assets/gray-right.svg";
import React from "react";
import TaskItem from "@/components/taskItem";
import PinIcon from "../../assets/map-pin-black.svg";
import { Button } from "@/components/Button";

export default function Profile() {
  const insets = useSafeAreaInsets();

  const { data } = useQuery({
    queryKey: ["desafios"],
    queryFn: () => getProfile("cmdq23mjp0000i23bkhfed2gv"),
    staleTime: 5 * 60 * 1000,
  });

  function formatarDataComDayjs(dataString: string) {
    dayjs.locale("pt-br");
    const data = dayjs(dataString);
    return data.format("DD [de] MMM. YYYY");
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="mb-[10px] pb-4 bg-bondis-black"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row h-[92px] justify-between mx-4 mt-4 ">
          <Link href="../" asChild>
            <TouchableOpacity className="w-12 h-12 justify-center items-center">
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          </Link>

          {data?.avatarUrl ? (
            <Image
              source={{ uri: data?.avatarUrl }}
              style={{
                width: 72,
                height: 72,
                marginTop: "auto",
                borderRadius: 999,
              }}
              contentFit="cover"
            />
          ) : (
            <Image
              source={require("../../assets/user2.png")}
              style={{
                width: 72,
                height: 72,
                marginTop: "auto",
                borderRadius: 999,
              }}
              contentFit="cover"
            />
          )}

          <View className="w-12 h-12" />
        </View>

        <Text className="text-bondis-green text-lg font-anton-regular text-center mt-[29px]">
          {data?.name}
        </Text>
        <Text className="text-center text-bondis-text-gray font-inter-regular text-sm mt-2 mx-4">
          {data?.bio}
        </Text>

        <View className="flex-row justify-between h-[51px] mt-[10px] mx-4">
          <View>
            <Text className="text-white text-lg text-center font-anton-regular">
              {data?.activeInscriptions}
            </Text>
            <Text className="text-[#828282] font-inter-regular">
              {data?.activeInscriptions === 1
                ? "Desafio ativo"
                : "Desafios ativos"}
            </Text>
          </View>
          <View>
            <Text className="text-white text-lg text-center font-anton-regular">
              {data?.completedChallengesCount}
            </Text>
            <Text className="text-[#828282] font-inter-regular">
              Desafios finalizados
            </Text>
          </View>
          <View>
            <Text className="text-white text-lg text-center font-anton-regular">
              {`${data?.totalDistance.toFixed(2)} Km`}
            </Text>
            <Text className="text-[#828282] font-inter-regular">
              Percorridos
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="font-anton-regular text-xl">Desafios ativos</Text>

        <View className="mt-[10px] rounded-lg px-2">
          <View className="w-[316px] rounded-xl border border-bondis-text-gray mx-auto overflow-hidden">
            <Image
              source={require("../../assets/corredores.png")}
              style={{
                width: "100%",
                height: 155,
              }}
              contentFit="cover"
            />

            <View className="p-4">
              <View className="flex-row justify-between">
                <Text className="font-bold">Cidade Maravilhosa</Text>
                <View className="flex-row items-center bg-bondis-text-gray rounded-xl px-2">
                  <PinIcon className="w-6 h-6" />
                  <Text className="text-xs ml-1">150Km</Text>
                </View>
              </View>

              <Text className="text-xs mt-1 mb-4">
                Iniciado em 5 de mai. 2025
              </Text>

              <Progress.Bar
                progress={40 / 100}
                width={null}
                height={4}
                color="#12FF55"
                unfilledColor="#999"
                borderColor="transparent"
                borderWidth={0}
              />

              <View className="flex-row justify-between mt-[6px]">
                <Text className="text-xs font-bold">30%</Text>
                <Text className="text-xs">15,32 de 150,00km</Text>
              </View>

              <View className="border-b-[0.6px] border-b-[#D9D9D9] mt-4"></View>

              <View className="mt-5 flex-row items-center mx-auto ">
                <Image
                  source={require("../../assets/frame.png")}
                  style={{
                    width: 66,
                    height: 24,
                    marginRight: 8,
                  }}
                  contentFit="cover"
                />

                <Text className="text-xs text-[#595959]">
                  + 200 atletas participantes
                </Text>
              </View>

              <TouchableOpacity className="h-[30px] bg-bondis-green mt-5 rounded-full items-center justify-center">
                <Text className="font-inter-bold text-xs text-black">
                  Ver desafio
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Text className="font-anton-regular text-xl mt-4 ml-4">
        Desafios concluídos
      </Text>

      <View className="bg-bondis-text-gray mt-[10px] rounded-lg mx-4 pl-2 pr-4">
        {data?.completedChallenges.map((challenge, index) => (
          <View
            className={`flex-row py-[10px] mx-auto  ${
              index < data.completedChallenges.length - 1
                ? "border-b-[1px] border-b-[#D9D9D9]"
                : ""
            }`}
            key={index}
          >
            <Image
              source={{ uri: challenge.photo }}
              style={{
                width: 63,
                height: 63,
                borderRadius: 4,
                marginRight: 8,
              }}
              contentFit="cover"
            />

            <View className="flex-1 flex-row justify-between items-center">
              <View>
                <Text className="font-bold text-sm mb-2">{challenge.name}</Text>

                <Text className="">
                  Concluído em{" "}
                  {formatarDataComDayjs(
                    data?.completedChallenges[index].completedAt
                  )}
                </Text>
              </View>

              <Rigth className="" />
            </View>
          </View>
        ))}
      </View>

      <Text className="font-anton-regular text-xl ml-4 mt-8">
        Últimas atividades ({data?.recentTasks.length})
      </Text>

      <View style={{ marginBottom: insets.bottom }}>
        {data?.recentTasks.map((activity, index) => (
          <View key={index}>
            <TaskItem
              task={{ ...activity, duration: +activity.duration }}
              openModalEdit={() => null}
              edit={false}
            />
            <View className="border-b-[0.6px] border-b-[#D9D9D9] mx-4"></View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
