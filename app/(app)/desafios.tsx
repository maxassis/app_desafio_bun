import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Left from "../../assets/arrow-left.svg";
import { router } from "expo-router";
import tokenExists from "../../store/auth-store";
import useDesafioStore from "../../store/desafio-store";
import { fetchDesafios } from "../../utils/api-service";
import { useLocalSearchParams } from "expo-router";

export default function DesafioSelect() {
  const token = tokenExists((state) => state.token);
  const setDesafioData = useDesafioStore((state) => state.setDesafioData);
  const { gps } = useLocalSearchParams();

  const {
    data: desafios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["desafios"],
    queryFn: () => fetchDesafios(token!),
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="pt-[38px] px-5">
        <View className="mb-[10px]">
          <TouchableOpacity
            onPress={() => router.push("/dashboard")}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Left />
          </TouchableOpacity>
        </View>

        <Text
          className={`text-2xl font-anton-regular mt-7 ${
            gps === "true" ? "" : "mb-7"
          }`}
        >
          Escolha um desafio
        </Text>

        {gps === "true" && (
          <>
            <Text className="text-base text-bondis-gray-dark mt-4">
              Você possui{" "}
              <Text className="font-inter-bold">{desafios?.length}</Text>{" "}
              desafios ativos!
            </Text>
            <Text className="text-base text-bondis-gray-dark mb-7">
              Escolha em qual deles deseja cadastrar sua atividade.
            </Text>
          </>
        )}

        {isLoading && (
          <Text className="text-center text-gray-500">
            Carregando desafios...
          </Text>
        )}

        {error && (
          <Text className="text-center text-red-500">
            Erro ao carregar desafios.
          </Text>
        )}

        {desafios && desafios.filter((item) => !item.completed).length > 0
          ? desafios
              .filter((item) => !item.completed)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setDesafioData(
                      item.id,
                      item.desafio.name,
                      +item.progress,
                      item.desafio.distance,
                      item.desafioId
                    );

                    if (gps === "true") {
                      router.push({
                        pathname: "/createTaskGps",
                        params: {
                          inscriptionId: item.id,
                          desafioId: item.desafioId,
                        },
                      });
                    } else {
                      router.push("/createTask");
                    }
                  }}
                  className="h-[94px] flex-row items-center px-3 py-[15px] border-b-[1px] border-b-[#D9D9D9]"
                >
                  <Image
                    source={{ uri: item.desafio.photo }}
                    contentFit="cover"
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                  />
                  <View className="ml-5">
                    <Text className="font-inter-bold text-base flex-wrap break-words">
                      {item.desafio.name}
                    </Text>
                    <Text className="font-inter-bold mt-[6.44px]">
                      {parseFloat(item.progress).toFixed(2)}km
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
          : !isLoading && (
              <Text className="text-center text-gray-500">
                Nenhum desafio disponível no momento.
              </Text>
            )}
      </View>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
