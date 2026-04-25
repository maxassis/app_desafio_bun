import { Text, View, SafeAreaView, Alert, TouchableOpacity } from "react-native";
import Left from "../../../assets/arrow-left.svg";
import Pen from "../../../assets/pen.svg";
import Tool from "../../../assets/tool.svg";
import Chat from "../../../assets/chat.svg";
import Lock from "../../../assets/lock.svg"
import useAuthStore from "../../../store/auth-store";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function MenuConfigurations() {
    const queryClient = useQueryClient()
    const router = useRouter(); 
    const { logout } = useAuthStore();
    const insets = useSafeAreaInsets();
   
    function showAlert() {
      Alert.alert("Deseja sair do App ?", "", [
        {
          text: "CANCELAR",
          style: "cancel",
        },
        {
          text: "SIM",
          onPress: async () => {
            await logout();
            queryClient.clear();
          },
        },
      ]);
    }

  return (
    <View className="flex-1 bg-white "  style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} >
      <View className="px-5 pb-4 pt-[28px] flex-1">
      <TouchableOpacity onPress={() => router.replace("/dashboard")} className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
        <Left  />
      </TouchableOpacity>

      <View className="mt-4 px-4">
        <TouchableOpacity onPress={() => router.push("/configEdit")}  className="flex-row items-center gap-x-4 border-b-[0.2px] mb-[bg-bondis-text-gray] py-4">
            <Pen />
            <Text className="text-base font-inter-regular">Editar perfil</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-x-4 border-b-[0.2px] mb-[bg-bondis-text-gray] py-4">
            <Tool/>
            <Text className="text-base font-inter-regular">Configurações da conta</Text>
        </View>
        <View className="flex-row items-center gap-x-4 border-b-[0.2px] mb-[bg-bondis-text-gray] py-4">
            <Chat />
            <Text className="text-base font-inter-regular">Conexões</Text>
        </View>
        <View className="flex-row items-center gap-x-4 border-b-[0.2px] mb-[bg-bondis-text-gray] py-4">
            <Lock />
            <Text className="text-base font-inter-regular">Termo de serviço e privacidade</Text>
        </View>
      </View>

      <View className="mt-auto">
        <TouchableOpacity onPress={() => showAlert()} className="border-[1px] mb-4 border-[#EB4335]  h-[51px] rounded-full justify-center items-center">
            <Text className="text-[#EB4335] text-base font-inter-bold">Sair</Text>
        </TouchableOpacity>
        <Text className="text-center text-sm font-inter-regular text-bg-gray-dark">Versão 1.0</Text>
    </View> 
    </View> 
    <SystemBars style="dark" />
    </View>
  );
}
