import { View, Text, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import useDesafioStore from "../../../store/desafio-store";
import { Image } from "@/components/uniwind-components";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDesafios } from "@/services/desafios-service";
import * as Progress from "react-native-progress";
import { router } from "expo-router";
import { useRef, useState } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export default function TaskCreatedSuccess() {
  const { desafioSelecionado } = useDesafioStore();
  const viewShotRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  console.log("taskCreatedSuccess: desafioSelecionado:", desafioSelecionado);

  const {
    data: allDesafios,
    isLoading: isLoadingAllDesafios,
    isError: isErrorAllDesafios,
    error: errorAllDesafios,
  } = useQuery({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
  });

  console.log("taskCreatedSuccess: allDesafios:", allDesafios);
  if (isErrorAllDesafios) {
    console.error("taskCreatedSuccess: Erro ao buscar allDesafios:", errorAllDesafios);
  }

  console.log(desafioSelecionado)

  const currentDesafio = allDesafios?.find(
    (desafio) => desafio.id === desafioSelecionado?.id
  );

  console.log("taskCreatedSuccess: currentDesafio:", currentDesafio);

  const totalDistance = currentDesafio?.distance;
  const userProgress = currentDesafio?.progressPercentage;
  const userDistance = currentDesafio?.totalDistanceCompleted;
  const desafioName = currentDesafio?.name;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Verifica se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Erro", "Compartilhamento não disponível neste dispositivo");
        return;
      }

      // Captura usando ViewShot
      const uri = await (viewShotRef.current as any).capture();
      
      // Compartilha a imagem
      await Sharing.shareAsync(uri, {
        dialogTitle: "Compartilhar progresso do desafio",
        mimeType: "image/png",
      });
     } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Alert.alert("Erro", "Não foi possível compartilhar a imagem");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 justify-center">
        
        {/* Conteúdo a ser capturado pelo ViewShot */}
        <ViewShot 
          ref={viewShotRef}
          options={{
            fileName: "desafio_progresso",
            format: "png",
            quality: 0.8,
            
          }}
          // className="bg-white py-10 px-5 rounded-lg"
          style={{ backgroundColor: "white", padding: 10, borderRadius: 8 }}
        >
          <Image
            className="w-[62px] h-[62px] mx-auto"
            contentFit="cover"
            source={require("../../../assets/palmas.png")}
          />

          <Text className="font-anton-regular text-2xl text-center mt-5">
            Mandou bem
          </Text>

          <Text className="text-bondis-gray-dark mt-10 mb-8 text-center px-1">
            Você completou <Text className="font-inter-bold">{Number(userDistance ?? 0).toFixed(2)}km</Text> e com isso conquistou <Text className="font-inter-bold">{Math.trunc(userProgress ?? 0)}%</Text> do desafio: {desafioName}. Continue assim!
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

          <Text className="font-inter-bold text-base mt-2 mb-8 text-center">
            {Number(userDistance ?? 0).toFixed(2)} de {Number(totalDistance ?? 0).toFixed(2)}km
          </Text>
        </ViewShot>

        {/* Botões fora do ViewShot */}
        <View className="mt-8">
          <TouchableOpacity
            className="h-[52px] flex-row bg-bondis-green rounded-full justify-center items-center"
            onPress={handleShare}
            disabled={isSharing}
          >
            <Text className="font-inter-bold text-base">
              {isSharing ? "Compartilhando..." : "Compartilhar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.replace("/taskList")}
            className="w-[120px] items-center mx-auto"
          >
            <Text className="font-inter-bold text-base mt-8 underline">
              Ver atividade
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
