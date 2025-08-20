import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import Close from "../../../assets/Close.svg";
import Logo from "../../../assets/logo2.svg";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SystemBars } from "react-native-edge-to-edge";
import Toast from "react-native-toast-message";

export default function Recovery() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/check-email",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "E-mail não cadastrado.",
          visibilityTime: 5000,
        });
        throw new Error(response.statusText);
      }

      router.push({
        pathname: "/recoveryCode",
        params: { email },
      });
    } catch (e) {
      console.error("Email nao cadastrado", e);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className=" px-5 pt-[28px]">
        <View className="items-end mb-[10px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Close />
          </TouchableOpacity>
        </View>

        <View className="h-[368px] pt-8">
          <Logo />

          <Text className="font-inter-bold text-2xl mt-4">
            Recupere seu acesso
          </Text>
          <Text className="text-bondis-gray-dark mt-4">
            Informe um e-mail válido para redefinir sua senha:
          </Text>

          <Text className="font-inter-bold text-base mt-8">E-mail</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "E-mail obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              },
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                autoCapitalize="none"
                onChangeText={onChange}
                className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-bondis-alert-red">
              {String(errors?.email?.message)}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center"
          >
            <Text className="font-inter-bold text-base">Recuperar senha</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SystemBars style="dark" />
    </View>
  );
}
