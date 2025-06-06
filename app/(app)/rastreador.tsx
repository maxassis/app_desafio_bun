import { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Pause from "../../assets/Pause.svg";
import Play from "../../assets/play.svg";
import LottieView from "lottie-react-native";
import useTracker from "../../hooks/useTracker";
import { router } from "expo-router";
import tokenExists from "../../store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDesafios } from "../../utils/api-service";
import useDesafioStore from "../../store/desafio-store";
import { HoldProgressButton } from "@/components/buttonAnime";

const fundoCinza = require("../../assets/fundo-cinza.png");
const fundoVerde = require("../../assets/fundo-verde.png");
const fundoPreto = require("../../assets/fundo-preto.png");

export default function Rastreador() {
  const {
    status,
    elapsed,
    city,
    distance,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
  } = useTracker();
  const lottieRef = useRef<any>(null);

  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastKm, setLastKm] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);

  const token = tokenExists((state) => state.token);
  const setDesafioData = useDesafioStore((state) => state.setDesafioData);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isPaused = status === "paused";

  const {
    data: desafios,
    isLoading: isDesafiosLoading,
    isError: isDesafiosError,
  } = useQuery({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
  });

  const handlePause = () => {
    pauseTracking();
    lottieRef.current?.pause();
  };

  const handleResume = () => {
    resumeTracking();
    lottieRef.current?.play();
  };

  function pressStop() {
    console.log("Botão pressionado!");
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  }

  function longPressStop() {
    const incomplete = desafios?.filter((desafio) => !desafio.completed) ?? [];

    if (incomplete.length === 1) {
      const desafio = incomplete[0];
      setDesafioData(desafio.id, desafio.name, 0, 0, desafio.id);

      router.push({
        pathname: "/createTaskGps",
        params: { desafioId: desafio.id, inscriptionId: desafio.inscriptionId },
      });
    } else if (incomplete.length > 1) {
      router.push({ pathname: "/desafios", params: { gps: "true" } });
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const calculatePace = (time: number, dist: number) => {
    if (dist <= 0) return "0'00\"";
    const minPerKm = time / 60 / dist;
    const min = Math.floor(minPerKm);
    const sec = Math.floor((minPerKm - min) * 60);
    return `${Math.min(min, 99)}'${sec.toString().padStart(2, "0")}"`;
  };

  const animatedNumberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const decrementCount = () => {
    if (countdownNumber > 1) {
      setCountdownNumber((prev) => prev - 1);
    } else {
      setShowCountdown(false);
      startTracking();
    }
  };

  useEffect(() => {
    if (showCountdown) {
      scale.value = 1;
      opacity.value = 1;

      scale.value = withSequence(
        withTiming(1.5, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withDelay(
          500,
          withTiming(0, { duration: 500 }, (finished) => {
            if (finished) runOnJS(decrementCount)();
          })
        )
      );
    }
  }, [countdownNumber, showCountdown]);

  useEffect(() => {
    if (!showCountdown) {
      // Detect split when user passes a new integer km
      const currentKm = Math.floor(distance);
      if (currentKm > lastKm) {
        setSplits((prev) => [...prev, elapsed]);
        setLastKm(currentKm);
      }
    }
  }, [distance, elapsed, showCountdown]);

  useEffect(() => {
    return () => {
      if (!showCountdown) stopTracking();
    };
  }, [showCountdown]);

  const backgroundImage = isPaused ? fundoCinza : fundoVerde;

  const paceAtual = calculatePace(elapsed, distance); // pace em tempo real
  const paceMedio = calculatePace(elapsed, distance); // pace médio igual ao atual neste caso

  return showCountdown ? (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
      <ImageBackground source={fundoPreto} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <Animated.Text
            style={[animatedNumberStyle, { color: "#74FE52" }]}
            className="font-anton-regular text-9xl leading-[300px]"
          >
            {countdownNumber}
          </Animated.Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  ) : (
    <SafeAreaView className="flex-1 text-white">
      <View className="bg-bondis-green flex-1">
        <ImageBackground
          source={backgroundImage}
          className="flex-1 pt-[60px] px-5"
        >
          <LottieView
            ref={lottieRef}
            source={require("../../assets/lottie/run3.json")}
            autoPlay
            loop
            style={{
              width: 80,
              height: 80,
              alignSelf: "center",
              marginBottom: 25,
            }}
          />

          <Text className="font-anton-regular text-[92px] text-center leading-[112px] pb-0">
            {formatTime(elapsed)}
          </Text>
          <Text className="text-center font-inter-regular text-xs text-[#00000099] relative top-[-10px]">
            Tempo de Atividade
          </Text>

          <Text className="text-[64px] text-center font-anton-regular leading-[78px] mt-[28px]">
            {distance.toFixed(2)}
          </Text>
          <Text className="text-center font-inter-regular text-xs text-[#00000099]">
            Distancia (Km)
          </Text>

          <View className="flex-row justify-between mt-[28px] mx-3">
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">
                {isPaused ? paceMedio : paceAtual}
              </Text>
              <Text className="text-xs text-[#00000099]">
                {isPaused ? "Pace Médio" : "Pace (min/km)"}
              </Text>
            </View>
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">100</Text>
              <Text className="text-xs text-[#00000099]">BPM</Text>
            </View>
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">001</Text>
              <Text className="text-xs text-[#00000099]">kcal</Text>
            </View>
          </View>

          {isPaused ? (
  <View className="mt-[143px] flex-row justify-between h-[90px] relative px-14">
    {/* Botão antigo comentado */}
    {/* <TouchableOpacity
      onPress={pressStop}
      onLongPress={longPressStop}
      className="rounded-full h-[90px] w-[90px] bg-black mx-auto flex items-center justify-center"
    >
      <View className="w-4 h-4 bg-white" />
    </TouchableOpacity> */}

    {/* Novo HoldProgressButton */}
    <HoldProgressButton
      onComplete={longPressStop}
      onShortPress={pressStop}
      duration={2000}
      style={{
        position: 'relative',
        width: 90,
        height: 90,
        marginLeft: 'auto',
        marginRight: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View className="w-4 h-4 bg-white" />
    </HoldProgressButton>

    <TouchableOpacity
      onPress={handleResume}
      className="rounded-full h-[90px] w-[90px] bg-[#74FE52] flex items-center justify-center"
    >
      <Play />
    </TouchableOpacity>

    {showTooltip && (
      <View className="top-[-75px] right-[35px] bg-black w-[300px] flex items-center justify-center p-4 absolute rounded-md">
        <Text className="text-white font-inter-regular text-xs">
          Mantenha o botão{" "}
          <Text className="font-inter-bold">pressionado</Text> para finalizar a atividade.
        </Text>
      </View>
    )}
  </View>
) : (
  <TouchableOpacity
    onPress={handlePause}
    className="rounded-full h-[90px] w-[90px] bg-black mx-auto mt-[143px]"
  >
    <Pause />
  </TouchableOpacity>
)}

          {/* <HoldProgressButton
            onComplete={() => Alert.alert("Ação completa!")}
            duration={2000}
          /> */}
        </ImageBackground>
      </View>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
