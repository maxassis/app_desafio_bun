import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Close from "../../../assets/Close.svg";
import Logo from "../../../assets/logo2.svg";
import Arrow from "../../../assets/arrow-right.svg";
import Refresh from "../../../assets/refresh.svg";
import { cva } from "class-variance-authority";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const buttonDisabled = cva(
  "h-[52px] flex-row bg-bondis-green mt-auto rounded-full justify-center items-center",
  {
    variants: {
      intent: {
        disabled: "opacity-50",
      },
    },
  }
);

export default function CreateAccountGetCode() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { name, email } = useLocalSearchParams();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<{ code: string }>();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(timerId);
  }, [isActive, timeLeft, hasStarted]);

  useEffect(() => {
    setTimeLeft(15);
    setIsActive(true);
    setHasStarted(false);
    sendMail(false); // Send email when component mounts without showing toast
  }, []);

  const startTimer = () => {
    setTimeLeft(20);
    setIsActive(true);
    setHasStarted(true);
    sendMail(true); // Send email when user requests resend with toast
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  function sendMail(showToast = true) {
    fetch("https://bondis-app-backend.onrender.com/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.error("Erro do servidor:", res.status, data);
          return;
        }

        if (showToast) {
          Toast.show({
            type: "success",
            text1: "Novo código enviado.",
            text2: "Por favor, verifique seu e-mail.",
            visibilityTime: 4000,
          });
        }

        // console.log("Resposta do backend:", data);
      })
      .catch((error) => {
        console.error("Erro na requisição:", error);
      });
  }

  const onSubmit = async ({ code }: { code: string }) => {
    try {
      const response = await fetch(
        "https://bondis-app-backend.onrender.com/confirm-code/",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ code, email }),
        }
      );
      // const data: { message: string } = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Código incorreto.",
          text2: "Digite outra vez.",
          visibilityTime: 4000,
        });

        throw new Error(`Código inválido, status ${response.status}`);
      }

      router.push({
        pathname: "/createAccountPassword",
        params: { name, email },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View
      className="flex-1 bg-white "
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="px-5 pt-[38px] pb-8 flex-1">
        <View className="items-end mb-[10px]">
          <TouchableOpacity className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
            <Close />
          </TouchableOpacity>
        </View>

        <Logo />

        <Text className="text-2xl font-inter-bold mt-4">
          {name}, verifique seu e-mail
        </Text>

        <Text className="mt-4 text-bondis-gray-dark text-base">
          Um código de verificação foi enviado para:
        </Text>
        <Text className="text-[#1977F3] text-base">{email}</Text>

        <Text className="font-inter-bold text-base mt-8">Informe o código</Text>
        <Controller
          control={control}
          name="code"
          rules={{
            required: "Código obrigatório",
            minLength: {
              value: 6,
              message: "O código possui 6 digitos",
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
        {errors.code && (
          <Text className="mt-1 text-bondis-gray-dark">
            {String(errors?.code?.message)}
          </Text>
        )}

        {isActive && (
          <Text className="font-inter-bold text-base mt-8">
            Não recebeu o código?
          </Text>
        )}

        {isActive ? (
          <Text className="mt-2 text-base">
            Aguarde{" "}
            <Text className="text-[#1977F3] text-base">
              {formatTime(timeLeft)}
            </Text>{" "}
            para reenviar
          </Text>
        ) : (
          <TouchableOpacity
            onPress={startTimer}
            disabled={isActive}
            className="flex-row items-center mt-8 gap-x-2"
          >
            <Refresh />
            <Text className="text-base underline font-inter-bold">
              Reenviar código
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          // className="h-[52px] flex-row bg-bondis-green mt-auto rounded-full justify-center items-center"
          disabled={isActive}
          className={buttonDisabled({
            intent: isActive ? "disabled" : null,
          })}
        >
          <Text className="font-inter-bold text-base">Proximo </Text>
          <Arrow />
        </TouchableOpacity>
      </View>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </View>
  );
}
