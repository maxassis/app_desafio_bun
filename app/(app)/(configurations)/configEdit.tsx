import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Image } from "expo-image";
import Left from "../../../assets/arrow-left.svg";
import User from "../../../assets/user.svg";
import Cam from "../../../assets/camera.svg";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";
import tokenExists from "../../../store/auth-store";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { fetchUserData } from "@/utils/api-service";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import LottieView from "lottie-react-native";

interface uploadAvatarResponse {
  avatar_url: string;
  avatar_filename: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getFileSize = async (uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error("Erro ao obter o tamanho do arquivo:", error);
    return 0;
  }
};

export default function ProfileEdit() {
  const token = tokenExists((state) => state.token);
  const [bioValue, setBioValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [unMaskedValue, setUnmaskedValue] = useState("");
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomSheetContent, setBottomSheetContent] = useState<
    "gender" | "sports" | null
  >(null);
  const lottieRef = useRef<any>(null);
  const [isBottomSheetRefOpen, setIsBottomSheetRefOpen] = useState(false);
  const [isBottomSheetAvatarRefOpen, setIsBottomSheetAvatarRefOpen] = useState(false);
  const [isBottomSheetSuccessRefOpen, setIsBottomSheetSuccessRefOpen] = useState(false);

  const snapPoints = useMemo(() => {
    if (bottomSheetContent === "gender") return ["30%"];
    if (bottomSheetContent === "sports") return ["30%"]; // Alterado para 30% para consistência
    return ["1%"];
  }, [bottomSheetContent]);
  const bottomSheetAvatarRef = useRef<BottomSheet>(null);
  const snapAvatarPoints = useMemo(() => ["20%"], []);
  const bottomSheetSuccessRef = useRef<BottomSheet>(null);
  const snapSuccessPoints = useMemo(() => ["35%"], []);

  const [genderValue, setGenderValue] = useState("");
  const [genderItems, setGenderItems] = useState([
    { label: "Homem", value: "homem" },
    { label: "Mulher", value: "mulher" },
    { label: "Não binario", value: "nao_binario" },
    { label: "Prefiro não responder", value: "prefiro_nao_responder" },
  ]);

  const [sportsValue, setSportsValue] = useState("");
  const [sportsItems, setSportsItems] = useState([
    { label: "Corrida", value: "corrida" },
    { label: "Bicicleta", value: "bicicleta" },
  ]);

  const [loadingUpload, setLoadingUpload] = useState(false);

  const { data: userConfig } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  useEffect(() => {
    if (userConfig) {
      setGenderValue(userConfig.gender ?? "");
      setSportsValue(userConfig.sport ?? "");
      setNameValue(userConfig.full_name ?? "");
      setBioValue(userConfig.bio ?? "");
      setUnmaskedValue(userConfig.birthDate ?? "");
    }
  }, [userConfig]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (formData: FormData): Promise<uploadAvatarResponse> => {
      setLoadingUpload(true);

      const response = await fetch(
        "https://bondis-app-backend.onrender.com/users/upload-avatar",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: "Bearer " + token,
          },
          body: formData,
        }
      );

      bottomSheetAvatarRef.current?.close();
      setLoadingUpload(false);

      if (!response.ok) {
        Alert.alert("Erro ao fazer upload do avatar");
        throw new Error("Erro ao fazer upload do avatar");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // console.log("Upload successful", data);
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error) => {
      console.error("Upload error", error);
      Alert.alert("Erro", "Falha ao enviar imagem, tente novamente");
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      setLoadingUpload(true);

      const result = await fetch(
        `https://bondis-app-backend.onrender.com/users/delete-avatar`,
        {
          method: "DELETE",
          headers: {
            authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            filename: userConfig?.avatar_filename,
          }),
        }
      );

      bottomSheetAvatarRef.current?.close();
      setLoadingUpload(false);

      if (!result.ok) {
        // console.log("Erro ao deletar avatar", result);
        Alert.alert("Erro ao deletar avatar");
        throw new Error("Erro ao deletar avatar");
      }

      return result.json();
    },
    onSuccess: () => {
      // Invalidate the userConfig query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error) => {
      // console.error("Delete avatar error", error);
      Alert.alert("Erro", "Falha ao remover imagem, tente novamente");
    },
  });

  const pickImage = async () => {
    let { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.3, 
      base64: true,
      allowsMultipleSelection: false,
    });

    if (!canceled && assets) {
      const fileSize = assets[0].uri ? await getFileSize(assets[0].uri) : 0;

      if (fileSize > MAX_FILE_SIZE) {
        Alert.alert(
          "Erro",
          "O arquivo é muito grande. O tamanho máximo permitido é 5 MB."
        );
        return;
      }

      const filename = assets[0].uri.split("/").pop();
      const extend = filename!.split(".").pop();

      const formData = new FormData();
      formData.append("file", {
        name: filename,
        uri: assets[0].uri,
        type: "image/" + extend,
      } as any);

      try {
        uploadAvatarMutation.mutate(formData);
      } catch (error) {
        console.error("Upload error", error);
        Alert.alert("Erro", "Falha ao enviar imagem, tente novamente");
      }
    }
  };

  const profileUpdateMutation = useMutation({
    mutationFn: async () => {
      const result = await fetch(
        "https://bondis-app-backend.onrender.com/users/edit-userdata",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: nameValue || null,
            bio: bioValue || null,
            gender: genderValue || null,
            sport: sportsValue || null,
            birthDate: unMaskedValue || null,
          }),
        }
      );

      if (!result.ok) {
        const data = await result.json();
        Alert.alert("Erro ao salvar alterações");
        throw new Error(data.message || "Erro ao salvar alterações");
      }

      return result.json();
    },
    onSuccess: (data) => {
      // console.log("Alterações salvas com sucesso", data);
      bottomSheetAvatarRef.current?.close();
      bottomSheetRef.current?.close();
      bottomSheetSuccessRef.current?.expand();
      lottieRef.current?.play();
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error) => {
      console.error("Erro ao salvar alterações:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    },
  });

  const handleGoBack = useCallback(() => {
    if (isBottomSheetRefOpen) {
      bottomSheetRef.current?.close();
      return true; // Evento tratado
    }
    if (isBottomSheetAvatarRefOpen) {
      bottomSheetAvatarRef.current?.close();
      return true; // Evento tratado
    }
    if (isBottomSheetSuccessRefOpen) {
      bottomSheetSuccessRef.current?.close();
      return true; // Evento tratado
    }
        router.replace("configInit");
    return false; // Permitir navegação padrão se nenhum bottom sheet estiver aberto
  }, [isBottomSheetRefOpen, isBottomSheetAvatarRefOpen, isBottomSheetSuccessRefOpen]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleGoBack
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        renderItem={() => null}
        data={[]}
        ListHeaderComponent={
          <View className="px-5 pb-8 pt-[28px] flex-1">
            <View className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
              <Left onPress={handleGoBack} />
            </View>
            <Text className="font-inter-bold text-2xl mt-7">
              Mantenha seu perfil atualizado
            </Text>

            <TouchableOpacity
              onPress={() => {
                bottomSheetRef.current?.close();
                bottomSheetSuccessRef.current?.close();
                bottomSheetAvatarRef.current?.expand();
              }}
              className="h-[94px] w-[94px] mt-8 relative"
              disabled={loadingUpload}
            >
              {userConfig?.avatar_url ? (
                <Image
                  source={{ uri: userConfig.avatar_url }}
                  className="w-[94px] h-[94px] rounded-full"
                  contentFit="cover"
                />
              ) : (
                <User />
              )}

              <Image
                source={require("../../../assets/cam.png")}
                className="absolute bottom-[-15px] right-[-10px]"
                contentFit="contain"
              />

              <View className="absolute bottom-[-10px] right-[-8px] bg-bondis-text-gray h-[36px] w-[36px] rounded-full justify-center items-center">
                <Cam />
              </View>
            </TouchableOpacity>

            <Text className="font-inter-bold text-base mt-[23px]">Nome</Text>
            <TextInput
              placeholder="Nome completo"
              value={nameValue}
              autoCapitalize="none"
              onChangeText={setNameValue}
              className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
            />

            <Text className="font-inter-bold text-base mt-[23px]">Bio</Text>
            <TextInput
              placeholder="Escreva um pouco sobre você..."
              numberOfLines={3}
              value={bioValue}
              autoCapitalize="none"
              onChangeText={setBioValue}
              className="bg-bondis-text-gray rounded-[4px] h-[144px] mt-2 p-4"
              style={{ textAlignVertical: "top" }}
            />

            <Text className="font-inter-bold text-base mt-[23px]">
              Data de Nascimento
            </Text>
            <MaskedTextInput
              placeholder="__/__/____"
              mask="99/99/9999"
              onChangeText={(text, rawText) => {
                setUnmaskedValue(rawText);
              }}
              value={unMaskedValue}
              className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
              keyboardType="numeric"
            />

            <Text className="font-inter-bold text-base mt-[23px]">
              Como você se identifica?
            </Text>
            <TouchableOpacity
              onPress={() => {
                bottomSheetAvatarRef.current?.close();
                bottomSheetSuccessRef.current?.close();
                setBottomSheetContent("gender");
                bottomSheetRef.current?.expand();
              }}
            >
              <View className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4 justify-center">
                <Text>
                  {genderValue
                    ? genderItems.find((item) => item.value === genderValue)
                        ?.label
                    : "Selecione"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text className="font-inter-bold text-base mt-[23px]">
              Esportes
            </Text>
            <TouchableOpacity
              onPress={() => {
                bottomSheetAvatarRef.current?.close();
                bottomSheetSuccessRef.current?.close();
                setBottomSheetContent("sports");
                bottomSheetRef.current?.expand();
              }}
            >
              <View className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4 justify-center">
                <Text>
                  {sportsValue
                    ? sportsItems.find((item) => item.value === sportsValue)
                        ?.label
                    : "Selecione"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => profileUpdateMutation.mutate()}
              disabled={profileUpdateMutation.isPending}
              className="h-[52px] mt-8 rounded-full justify-center items-center bg-bondis-green"
            >
              <Text className="font-inter-bold text-base">
                {profileUpdateMutation.isPending
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BottomSheet
        ref={bottomSheetAvatarRef}
        snapPoints={snapAvatarPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={(index) => setIsBottomSheetAvatarRefOpen(index !== -1)}
      >
        <BottomSheetView className="flex-1 z-50">
          <View className="mx-5">
            {!loadingUpload ? (
              <>
                <TouchableOpacity
                  className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
                  onPress={pickImage}
                >
                  <Text className="text-center text-base ">
                    Escolher uma foto na galeria
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="h-[51px] justify-center items-center"
                  onPress={() => deleteAvatarMutation.mutate()}
                  disabled={userConfig?.avatar_url ? false : true}
                >
                  <Text
                    className={disabledDeleteBtn({
                      intent: !userConfig?.avatar_url ? "disabled" : null,
                    })}
                  >
                    Remover foto
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                className="flex-row justify-center items-center h-full"
                style={{ paddingBottom: insets.bottom }}
              >
                <Text className="font-inter-bold text-base mr-3">
                  Carregando...
                </Text>
                <ActivityIndicator size="large" color="#12FF55" />
              </View>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={(index) => setIsBottomSheetRefOpen(index !== -1)}
      >
        <BottomSheetView className="flex-1 z-50">
          {bottomSheetContent === "gender" && (
            <View className="mx-5">
              {genderItems.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setGenderValue(item.value);
                    bottomSheetRef.current?.close();
                  }}
                  className={`h-[51px] justify-center items-center ${
                    index === genderItems.length - 1
                      ? ""
                      : "border-b-[0.2px] border-b-gray-400"
                  }`}
                >
                  <Text className="text-base">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {bottomSheetContent === "sports" && (
            <View className="mx-5">
              {sportsItems.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setSportsValue(item.value);
                    bottomSheetRef.current?.close();
                  }}
                  className={`h-[51px] justify-center items-center ${
                    index === sportsItems.length - 1
                      ? ""
                      : "border-b-[0.2px] border-b-gray-400"
                  }`}
                >
                  <Text className="text-base">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetSuccessRef}
        snapPoints={snapSuccessPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={(index) => setIsBottomSheetSuccessRefOpen(index !== -1)}
      >
        <BottomSheetView className="flex-1 z-50">
          <View className="justify-center items-center pt-[20px] px-5">
            <LottieView
              ref={lottieRef}
              source={require("../../../assets/lottie/check-lottie.json")}
              loop={false}
              style={{
                width: 80,
                height: 80,
                alignSelf: "center",
              }}
            />
            <Text className="font-anton-regular text-lg mt-3 text-center">
              Perfil atualizado com sucesso!
            </Text>

            <TouchableOpacity
              className="w-full items-center justify-center h-[52px] rounded-[31px] text-black border mt-[26px] border-[#D9D9D9]"
              onPress={() => bottomSheetSuccessRef.current?.close()}
            >
              <Text>OK</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <SystemBars style="dark" />
    </View>
  );
}

const disabledDeleteBtn = cva("text-center text-base pt-4 text-[#EB4335]", {
  variants: {
    intent: {
      disabled: "opacity-50",
    },
  },
});
