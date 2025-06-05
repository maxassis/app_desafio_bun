import { useRef, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import Plus from "../../assets/plus.svg";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import Logo from "../../assets/logo-white.svg";
import Settings from "../../assets/settings.svg";
import { useRouter } from "expo-router";
import CardDesafio from "@/components/cardDesafio";
import { fetchUserData, fetchAllDesafios } from "@/utils/api-service";

export default function Profile() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);

  const isBottomSheetOpen = useRef(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    isSuccess: isUserSuccess,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  const {
    data: allDesafios,
    isLoading: isDesafiosLoading,
    isError: isDesafiosError,
  } = useQuery({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
  });

  const desafiosEmCurso =
    allDesafios?.filter(
      (desafio) => desafio.isRegistered && !desafio.completed
    ) || [];
  const desafiosDisponiveis =
    allDesafios?.filter((desafio) => !desafio.isRegistered) || [];
  const desafiosConcluidos =
    allDesafios?.filter((desafio) => desafio.completed) || [];

  const totalDistance = useMemo(() => {
    if (!allDesafios) return 0;

    return allDesafios.reduce((total, desafio) => {
      if (desafio.isRegistered && (desafio.completed || !desafio.completed)) {
        return total + (Number(desafio.totalDistanceCompleted) || 0);
      }
      return total;
    }, 0);
  }, [allDesafios]);

  // Formata a distância para exibição (arredonda para o km mais próximo)
  const formattedDistance = `${totalDistance.toFixed(2)} km`;

  const handleOpenBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      isBottomSheetOpen.current = true;
    }
  };

  const handleCloseBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      isBottomSheetOpen.current = false;
    }
  };

  // Handle Android back button press
  useEffect(() => {
    const backAction = () => {
      if (isBottomSheetOpen.current) {
        handleCloseBottomSheet();
        return true; // Prevent default back behavior
      }
      return false; // Let default back behavior happen
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Add this callback to track bottom sheet state
  const handleSheetChanges = (index: number) => {
    isBottomSheetOpen.current = index === 0;
  };

  // Check if there are any active challenges to show the "+" button
  const hasActiveDesafios = desafiosEmCurso.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" overScrollMode="never">
        <View className="h-[300px] mb-[10px] bg-bondis-black">
          <View className="flex-row h-[92px] justify-between mx-4 mt-[35px]">
            <Logo />
            {isUserLoading ? (
              // <ActivityIndicator size="small" color="#00ff00" />
              <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: "#e0e0e0" }} />
            ) : isUserSuccess && userData?.avatar_url ? (
              <Image
                source={{ uri: userData.avatar_url }}
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
            <TouchableOpacity onPress={() => router.push("/configInit")}>
              <Settings />
            </TouchableOpacity>
          </View>

          {isUserLoading && (
            <Text className="text-center text-white mt-5"></Text>
          )}
          {isUserError && (
            <Text className="text-center text-red-500 mt-5">
              Erro ao carregar usuário
            </Text>
          )}
          {isUserSuccess && (
            <>
              <Text className="text-bondis-green text-lg font-anton-regular text-center mt-[29px]">
                {userData.username}
              </Text>
              <Text className="text-center text-bondis-text-gray font-inter-regular text-sm mt-2">
                {userData.bio}
              </Text>
            </>
          )}

          <View className="flex-row justify-between h-[51px] mt-[10px] mx-4">
            <View>
              <Text className="text-white text-lg text-center font-anton-regular">
                {desafiosEmCurso.length}
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                {desafiosEmCurso.length === 1
                  ? "Desafio ativo"
                  : "Desafios ativos"}
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-anton-regular">
                {desafiosConcluidos.length}
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Desafios finalizados
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-anton-regular">
                {formattedDistance}
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Percorridos
              </Text>
            </View>
          </View>
        </View>

        <View className="h-full pb-8 pt-4">
          {/* Desafios em Curso */}
          {desafiosEmCurso.length > 0 && (
            <>
              <View className="mb-4 pl-5">
                <Text className="font-anton-regular text-xl">
                  Desafios ativos
                </Text>
              </View>

              {isDesafiosLoading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : isDesafiosError ? (
                <Text className="text-center text-red-500">
                  Erro ao carregar desafios
                </Text>
              ) : (
                <View className="h-[182px] w-full">
                  <FlatList
                    data={desafiosEmCurso}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ gap: 0, paddingHorizontal: 0 }}
                    overScrollMode="never"
                    // scrollEventThrottle={16}
                    // decelerationRate="fast"
                    // pagingEnabled={false}
                    renderItem={({ item }) => (
                      <View className="w-[216px] f-full">
                        <CardDesafio
                          desafioId={item.id}
                          name={item.name}
                          distance={item.distance}
                          progress={item.progressPercentage + ""}
                          isRegistered={item.isRegistered}
                          completed={item.completed}
                          photo={item.photo}
                          inscriptionId={item.inscriptionId}
                        />
                      </View>
                    )}
                  />
                </View>
              )}
            </>
          )}

          {!isDesafiosLoading &&
            !isDesafiosError &&
            desafiosDisponiveis.length > 0 && (
              <>
                <View className="mb-4 pl-5 mt-8">
                  <Text className="font-anton-regular text-xl my-auto">
                    Desafios Disponíveis
                  </Text>
                </View>

                <View className="h-[293px] w-full">
                  <FlatList
                    data={desafiosDisponiveis}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ gap: 0, paddingHorizontal: 0 }}
                    overScrollMode="never"
                    // scrollEventThrottle={16}
                    // decelerationRate="fast"
                    // pagingEnabled={false}
                    renderItem={({ item }) => (
                      <View className="w-[253px]">
                        <CardDesafio
                          desafioId={item.id}
                          name={item.name}
                          distance={item.distance}
                          progress={item.progressPercentage + ""}
                          isRegistered={item.isRegistered}
                          completed={item.completed}
                          photo={item.photo}
                          inscriptionId={item.inscriptionId}
                        />
                      </View>
                    )}
                  />
                </View>
              </>
            )}

          {/* Show loading indicator or error for Desafios Disponíveis only if needed */}
          {isDesafiosLoading && (
            <ActivityIndicator size="large" color="#00ff00" />
          )}

          {isDesafiosError && (
            <Text className="text-center text-red-500">
              Erro ao carregar desafios
            </Text>
          )}

          {desafiosConcluidos.length > 0 && (
            <>
              <View className="mb-4 pl-5 mt-8">
                <Text className="font-anton-regular text-xl my-auto">
                  Desafios Concluídos
                </Text>
              </View>

              {isDesafiosLoading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : isDesafiosError ? (
                <Text className="text-center text-red-500">
                  Erro ao carregar desafios
                </Text>
              ) : (
                <View className="h-[182px] w-full">
                  <FlatList
                    data={desafiosConcluidos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ gap: 0, paddingHorizontal: 0 }}
                    overScrollMode="never"
                    // scrollEventThrottle={16}
                    // decelerationRate="fast"
                    // pagingEnabled={false}
                    renderItem={({ item }) => (
                      <View className="w-[216px] f-full">
                        <CardDesafio
                          desafioId={item.id}
                          name={item.name}
                          distance={item.distance}
                          progress={item.progressPercentage + ""}
                          isRegistered={item.isRegistered}
                          completed={item.completed}
                          photo={item.photo}
                          inscriptionId={item.inscriptionId}
                        />
                      </View>
                    )}
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Only render the + button if there are active challenges */}
      {hasActiveDesafios && (
        <TouchableOpacity
          onPress={handleOpenBottomSheet}
          className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-5 bottom-5"
        >
          <Plus />
        </TouchableOpacity>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={handleSheetChanges}
      >
        <BottomSheetView className="flex-1 z-50">
          <Text className="font-inter-bold mt-[10px] text-base mx-5 mb-4">
            Adicione uma nova atividade
          </Text>
          <View className="mx-5">
            <TouchableOpacity
              onPress={() => router.push("/rastreador")}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Iniciar agora</Text>
            </TouchableOpacity>
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Sincronizar via Strava</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/desafios")}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Cadastrar manualmente</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
