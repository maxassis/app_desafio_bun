import { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  ImageBackground,
  Text,
  Image,
  TouchableOpacity,
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

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isPaused = status === "paused";

  const handlePause = () => {
    pauseTracking();
    lottieRef.current?.pause(); 
  };

  const handleResume = () => {
    resumeTracking();
    lottieRef.current?.play(); 
  };

  function pressStop() {
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  }

  function longPressStop() {
    router.push({ pathname: "/createTaskGps", params: { distance, elapsed, city } });
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const [pace, setPace] = useState("0'00\"");

  useEffect(() => {
    calculateAndUpdatePace();
    const paceInterval = setInterval(() => {
      calculateAndUpdatePace();
    }, 3000);
    return () => {
      clearInterval(paceInterval);
    };
  }, []);

  useEffect(() => {
    calculateAndUpdatePace();
  }, [distance]);

  const calculateAndUpdatePace = () => {
    if (distance <= 0) {
      setPace("0'00\"");
      return;
    }

    const minutesPerKm = elapsed / 60 / distance;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.floor((minutesPerKm - minutes) * 60);
    const displayMinutes = Math.min(minutes, 99);
    const displaySeconds = minutes > 99 ? 59 : seconds;
    setPace(`${displayMinutes}'${displaySeconds.toString().padStart(2, "0")}"`);
  };

  const animatedNumberStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

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
            if (finished) {
              runOnJS(decrementCount)();
            }
          })
        )
      );
    }
  }, [countdownNumber, showCountdown]);

  useEffect(() => {
    return () => {
      if (!showCountdown) {
        stopTracking();
      }
    };
  }, [showCountdown]);

  const backgroundImage = isPaused ? fundoCinza : fundoVerde;

  if (showCountdown) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
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
    );
  }

  return (
    <SafeAreaView className="flex-1 text-white">
      <View className="bg-bondis-green flex-1">
        <ImageBackground source={backgroundImage} className="flex-1 pt-[60px] px-5">
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
          <Text className="text-center font-inter-regular text-xs text-[#00000099] ">
            Distancia (Km)
          </Text>

          <View className="flex-row justify-between mt-[28px] mx-3">
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">{pace}</Text>
              <Text className="text-xs text-[#00000099] ">Pace (min/km)</Text>
            </View>
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">100</Text>
              <Text className="text-xs text-[#00000099] ">BPM</Text>
            </View>
            <View className="justify-center items-center">
              <Text className="text-[36px] font-anton-regular">001</Text>
              <Text className="text-xs text-[#00000099] ">kcal</Text>
            </View>
          </View>

          {isPaused ? (
            <View className="mt-[143px] flex-row h-[90px] relative">
              <TouchableOpacity
                onPress={pressStop}
                onLongPress={longPressStop}
                className=" rounded-full h-[90px] w-[90px] bg-black mx-auto flex items-center justify-center"
              >
                <View className="w-4 h-4 bg-white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResume} // 👈
                className="rounded-full h-[90px] w-[90px] bg-[#74FE52] mx-auto flex items-center justify-center"
              >
                <Play />
              </TouchableOpacity>

              {showTooltip && (
                <View className=" top-[-75px] right-[35px] bg-black w-[300px] flex items-center justify-center p-4 absolute rounded-md">
                  <Text className="text-white font-inter-regular text-xs">
                    Mantenha o botão{" "}
                    <Text className="font-inter-bold">pressionado</Text> para
                    finalizar a atividade.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePause} // 👈
              className="rounded-full h-[90px] w-[90px] bg-black mx-auto mt-[143px]"
            >
              <Pause />
            </TouchableOpacity>
          )}
        </ImageBackground>
      </View>
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
    </SafeAreaView>
  );
}
