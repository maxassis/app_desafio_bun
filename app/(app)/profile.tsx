import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
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

        <View className="bg-bondis-text-gray mt-[10px] rounded-lg px-2">
          {data?.activeChallenges.map((challenge, index) => (
            <View
              className={`flex-row py-[10px] mx-auto  ${
                index < data.activeChallenges.length - 1
                  ? "border-b-[1px] border-b-[#D9D9D9]"
                  : ""
              }`}
              key={index}
            >
              <Image
                source={{ uri: data?.activeChallenges[index].photo }}
                style={{
                  width: 63,
                  height: 63,
                  borderRadius: 4,
                  marginRight: 8,
                }}
                contentFit="cover"
              />

              <View className="flex-1">
                <Text className="font-bold text-sm mb-2">{challenge.name}</Text>

                <Progress.Bar
                  progress={challenge.completionPercentage / 100}
                  width={null}
                  height={8}
                  color="#12FF55"
                  unfilledColor="#565656"
                  borderColor="transparent"
                  borderWidth={0}
                />

                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm font-bold">
                    {challenge.completionPercentage}%
                  </Text>
                  <Text className="text-sm">{`${
                    challenge.distanceCovered > challenge.totalDistance
                      ? challenge.totalDistance
                      : challenge.distanceCovered
                  } de ${challenge.totalDistance.toFixed(2)}Km`}</Text>
                </View>
              </View>
            </View>
          ))}
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
            <View className="border-b-[1px] border-b-[#D9D9D9] mx-4"></View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
