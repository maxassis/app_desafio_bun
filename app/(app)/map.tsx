import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, ActivityIndicator, TouchableOpacity, Image, Text, FlatList } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { Image as ExpoImage } from "expo-image";
import MapView, { Polyline, PROVIDER_GOOGLE, Marker, Camera } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { mapStyle } from "../../styles/mapStyles";
import { router } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import { cva } from "class-variance-authority";
import RankingBottomSheet from "../../components/bottomSheeetMap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { fetchUserData, fetchRouteData } from "@/utils/api-service";
import useDesafioStore from "@/store/desafio-store";
import { haversine } from "@/utils/gpsFunctions";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserParticipation {
  avatar: string;
  location: Coordinate;
  name: string;
  userId: string;
  distance: number;
  percentage: string;
  totalTasks: number;
  totalCalories: number;
  totalDistanceKm: number;
  lastTaskDate: Date;
}

export default function Map2() {
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [usersParticipants, setUsersParticipants] = useState<UserParticipation[]>([]);
  const { desafioId } = useDesafioStore();
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">("standard");
  const [tilt, setTilt] = useState<number>(0);
  const insets = useSafeAreaInsets();

  const { data: routeData, isLoading, isSuccess } = useQuery({
    queryKey: ["routeData", desafioId],
    queryFn: () => fetchRouteData(desafioId + ""),
  });

  const { data: userConfig } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  useEffect(() => {
    dayjs.extend(relativeTime);
    dayjs.locale("pt-br");
    dayjs.extend(utc);
  }, []);

  useEffect(() => {
    if (isSuccess && routeData && mapReady) {
      const coordinates = routeData.location;
      setRouteCoordinates(coordinates);

      const totalDistance = +routeData.distance;

      const updatedParticipants = routeData.inscription.map((dta) => {
        const userLocation = findPointAtDistance(coordinates, dta.progress);
        const userDistance = calculateUserDistance(coordinates, dta.progress);
        const progressPercentage = formatPercentage((userDistance / totalDistance) * 100);

        if (dta.user.id === userConfig?.usersId) {
          setUserProgress(Number(progressPercentage) / 100);
          setUserDistance(dta.progress);
        }

        return {
          userId: dta.user.id,
          name: dta.user.name,
          avatar: dta.user.UserData?.avatar_url || "",
          location: userLocation || coordinates[0],
          distance: userDistance,
          percentage: progressPercentage,
          totalTasks: dta.totalTasks,
          totalCalories: dta.totalCalories,
          totalDistanceKm: dta.totalDistanceKm,
          lastTaskDate: dta.lastTaskDate,
        };
      });

      setUsersParticipants(updatedParticipants);

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      // Definir que os marcadores estão prontos após um pequeno delay
      // para garantir que o layout foi completamente carregado
      setTimeout(() => {
        setMarkersReady(true);
      }, 1000);
    }
  }, [isSuccess, routeData, mapReady]);

  const getUserPath = useMemo(() => {
    if (!routeCoordinates.length || userDistance === 0) return [];
    const path: Coordinate[] = [];
    let traveled = 0;

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const start = routeCoordinates[i];
      const end = routeCoordinates[i + 1];
      const segmentDistance = haversine(start.latitude, start.longitude, end.latitude, end.longitude);

      if (traveled + segmentDistance >= userDistance) {
        const ratio = (userDistance - traveled) / segmentDistance;
        path.push(start, {
          latitude: start.latitude + (end.latitude - start.latitude) * ratio,
          longitude: start.longitude + (end.longitude - start.longitude) * ratio,
        });
        break;
      } else {
        path.push(start);
        traveled += segmentDistance;
      }
    }
    return path;
  }, [routeCoordinates, userDistance]);

  const userMarkers = useMemo(() => {
    if (!routeData) return null;
    return usersParticipants.map((user, index) => (
      <Marker
        key={user.userId}
        onPress={() => {}}
        coordinate={user.distance > +routeData.distance ? routeCoordinates[routeCoordinates.length - 1] : user.location}
        style={{ zIndex: user.userId === userConfig?.usersId ? 50 : index, elevation: user.userId === userConfig?.usersId ? 50 : index }}
        tracksViewChanges={!markersReady}
        title={`${user.name} - ${user.distance} Km`}
      >
        <View className={userPin({ intent: user.userId === userConfig?.usersId ? "user" : null })}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} className={photoUser({ intent: user.userId === userConfig?.usersId ? "user" : null })} />
          ) : (
            <Image source={require("../../assets/user2.png")} className="h-[32px] w-[32px] rounded-full" />
          )}
        </View>
      </Marker>
    ));
  }, [usersParticipants, userConfig, routeData, routeCoordinates, markersReady]);

  const toggleMapType = () => setMapType(prev => prev === "standard" ? "satellite" : prev === "satellite" ? "hybrid" : "standard");

  const animateCamera = (cameraParams: Partial<Camera>) => mapRef.current?.animateCamera(cameraParams, { duration: 1000 });

  const adjustTilt = (delta: number) => {
    const newTilt = Math.max(0, Math.min(tilt + delta, 60));
    setTilt(newTilt);
    animateCamera({ pitch: newTilt });
  };

  const resetCamera = () => {
    setTilt(0);
    animateCamera({ pitch: 0, heading: 0 });
    mapRef.current?.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  const focusOnUser = (user: UserParticipation) => animateCamera({ center: user.location, pitch: 60, zoom: 16 });

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {isLoading ? (
        <ActivityIndicator size="large" color="#12FF55" />
      ) : (
        <MapView
          ref={mapRef}
          onMapReady={() => setMapReady(true)}
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapType === "standard" ? mapStyle : []}
          showsCompass={false}
          toolbarEnabled={false}
          zoomControlEnabled={false}
          mapType={mapType}
        >
          {routeCoordinates.length > 0 && (
            <>
              <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#000" zIndex={1} />
              <Polyline coordinates={getUserPath} strokeWidth={2} strokeColor="#12FF55" zIndex={2} />
            </>
          )}
          {userMarkers}
          {routeCoordinates.length > 0 && (
            <Marker
              key="final"
              coordinate={routeCoordinates[routeCoordinates.length - 1]}
              style={{ zIndex: 40, elevation: 40 }}
              title="Final"
              tracksViewChanges={!markersReady}
            >
              <Image source={require("../../assets/final-pin.png")} className="h-[40px] w-[40px] rounded-full" />
            </Marker>
          )}
        </MapView>
      )}

      {/* Botões */}
      <TouchableOpacity onPress={() => router.push("/dashboard")} className="absolute top-[40px] left-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
        <Left />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleMapType} className="absolute top-[40px] right-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center px-3">
        <Octicons name="stack" size={16} color="black" />
      </TouchableOpacity>

      <View className="absolute right-[13px] top-[100px] bg-bondis-text-gray rounded-full overflow-hidden">
        <TouchableOpacity onPress={() => adjustTilt(15)} className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400">
          <AntDesign name="arrowup" size={16} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => adjustTilt(-15)} className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400">
          <AntDesign name="arrowdown" size={16} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={resetCamera} className="h-[40px] w-[40px] justify-center items-center">
          <AntDesign name="reload1" size={16} color="black" />
        </TouchableOpacity>
      </View>

      <View className="absolute w-full bottom-[22.5%] items-center">
        <FlatList
          data={usersParticipants}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => focusOnUser(item)} className="p-4 w-[311px] rounded-2xl bg-white" activeOpacity={0.7}>
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start">
                  {item.avatar ? (
                    <ExpoImage source={{ uri: item.avatar }} style={{ width: 43, height: 43, borderRadius: 100 }} />
                  ) : (
                    <Image source={require("../../assets/user2.png")} className="h-[43px] w-[43px] rounded-full" />
                  )}
                  <Text className="text-base font-inter-bold ml-2">{item.name}</Text>
                </View>
                <Text className="text-[#707271] text-[12px]">{dayjs(item.lastTaskDate).utc().local().fromNow()}</Text>
              </View>

              <View className="flex-row w-1/3 h-[37px] items-center justify-between mt-3">
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">{item.percentage}</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">km</Text>
                </View>
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">{item.totalTasks}</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">ATIVIDADES</Text>
                </View>
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">{item.totalCalories}</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">CAL. TOTAIS</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <RankingBottomSheet routeData={routeData} userProgress={userProgress} userDistance={userDistance} userData={userConfig} />

      <SystemBars style="dark" />
    </View>
  );
}

/* Utils */
function findPointAtDistance(coordinates: Coordinate[], distance: number): Coordinate {
  let traveled = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i], end = coordinates[i + 1];
    const segmentDistance = haversine(start.latitude, start.longitude, end.latitude, end.longitude);
    if (traveled + segmentDistance >= distance) {
      const ratio = (distance - traveled) / segmentDistance;
      return { latitude: start.latitude + (end.latitude - start.latitude) * ratio, longitude: start.longitude + (end.longitude - start.longitude) * ratio };
    }
    traveled += segmentDistance;
  }
  return coordinates[coordinates.length - 1];
}

function calculateUserDistance(coordinates: Coordinate[], progress: number): number {
  let traveled = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i], end = coordinates[i + 1];
    const segmentDistance = haversine(start.latitude, start.longitude, end.latitude, end.longitude);
    if (traveled + segmentDistance >= progress) return traveled + (progress - traveled);
    traveled += segmentDistance;
  }
  return traveled;
}

function formatPercentage(progress: number): string {
  return progress.toLocaleString("en-US", { minimumIntegerDigits: 2, maximumFractionDigits: 1 });
}

const userPin = cva("h-[35px] w-[35px] rounded-full bg-black justify-center items-center", {
  variants: { intent: { user: "bg-bondis-green h-[39px] w-[39px]" } }
});

const photoUser = cva("h-[30px] w-[30px] rounded-full", {
  variants: { intent: { user: "h-[34px] w-[34px]" } }
});
