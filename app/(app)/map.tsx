import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  Platform,
  Pressable,
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { Image as ExpoImage } from "expo-image";
import MapView, {
  Polyline,
  PROVIDER_GOOGLE,
  Marker,
  Camera,
} from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { cva } from "class-variance-authority";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import RankingBottomSheet from "../../components/bottomSheeetMap";
import Left from "../../assets/arrow-left.svg";

// Utils & Services
import { fetchUserData, fetchRouteData } from "@/utils/api-service";
import useDesafioStore from "@/store/desafio-store";
import {
  haversine,
  findPointAtDistance,
  calculateUserDistance,
  type Coordinate,
} from "@/utils/gpsFunctions";
import { mapStyle } from "../../styles/mapStyles";

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

type MapType = "standard" | "satellite" | "hybrid";

// Constants
const MAP_EDGE_PADDING = { top: 50, right: 50, bottom: 50, left: 50 };
const ANIMATION_DURATION = 1000;
const MARKERS_READY_DELAY = 1000;
const MAX_TILT = 60;
const TILT_STEP = 15;

// Styles
const userPin = cva(
  "h-[35px] w-[35px] rounded-full bg-black justify-center items-center",
  {
    variants: { intent: { user: "bg-bondis-green h-[39px] w-[39px]" } },
  }
);

const photoUser = cva("h-[30px] w-[30px] rounded-full", {
  variants: { intent: { user: "h-[34px] w-[34px]" } },
});

// Utility Functions
const formatPercentage = (progress: number): string => {
  return progress.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    maximumFractionDigits: 1,
  });
};

// Custom Hooks
const useDayjs = () => {
  useEffect(() => {
    dayjs.extend(relativeTime);
    dayjs.locale("pt-br");
    dayjs.extend(utc);
  }, []);
};

const useMapData = (desafioId: string) => {
  const routeQuery = useQuery({
    queryKey: ["routeData", desafioId],
    queryFn: () => fetchRouteData(desafioId),
    enabled: !!desafioId,
  });

  const userQuery = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  return { routeQuery, userQuery };
};

// Main Component
export default function Map2() {
  // State
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [usersParticipants, setUsersParticipants] = useState<
    UserParticipation[]
  >([]);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [tilt, setTilt] = useState<number>(0);

  // Refs & Store
  const mapRef = useRef<MapView>(null);
  const { desafioId } = useDesafioStore();
  const insets = useSafeAreaInsets();

  // Custom Hooks
  useDayjs();
  const { routeQuery, userQuery } = useMapData(desafioId + "");
  const { data: routeData, isLoading, isSuccess } = routeQuery;
  const { data: userConfig } = userQuery;

  // Process route data and participants
  const processRouteData = useCallback(() => {
    if (!isSuccess || !routeData || !mapReady) return;

    const coordinates = routeData.location;
    setRouteCoordinates(coordinates);

    const totalDistance = +routeData.distance;

    const updatedParticipants = routeData.inscription.map((dta) => {
      const userLocation = findPointAtDistance(coordinates, dta.progress);
      const userDistance = calculateUserDistance(coordinates, dta.progress);
      const progressPercentage = formatPercentage(
        (userDistance / totalDistance) * 100
      );

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

    // Fit map to coordinates
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: MAP_EDGE_PADDING,
      animated: false,
    });

    // Set markers ready after delay
    setTimeout(() => setMarkersReady(true), MARKERS_READY_DELAY);
  }, [isSuccess, routeData, mapReady, userConfig?.usersId]);

  useEffect(() => {
    processRouteData();
  }, [processRouteData]);

  // Calculate user path
  const getUserPath = useMemo(() => {
    if (!routeCoordinates.length || userDistance === 0) return [];

    const path: Coordinate[] = [];
    let traveled = 0;

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const start = routeCoordinates[i];
      const end = routeCoordinates[i + 1];
      const segmentDistance = haversine(
        start.latitude,
        start.longitude,
        end.latitude,
        end.longitude
      );

      if (traveled + segmentDistance >= userDistance) {
        const ratio = (userDistance - traveled) / segmentDistance;
        path.push(start, {
          latitude: start.latitude + (end.latitude - start.latitude) * ratio,
          longitude:
            start.longitude + (end.longitude - start.longitude) * ratio,
        });
        break;
      } else {
        path.push(start);
        traveled += segmentDistance;
      }
    }

    return path;
  }, [routeCoordinates, userDistance]);

  // User markers
  const userMarkers = useMemo(() => {
    if (!routeData) return null;

    return usersParticipants.map((user, index) => {
      const isCurrentUser = user.userId === userConfig?.usersId;
      const coordinate =
        user.distance > +routeData.distance
          ? routeCoordinates[routeCoordinates.length - 1]
          : user.location;

      return (
        <Marker
          key={user.userId}
          coordinate={coordinate}
          style={{
            zIndex: isCurrentUser ? 50 : index,
            elevation: isCurrentUser ? 50 : index,
          }}
          tracksViewChanges={!markersReady}
          title={`${user.name} - ${user.distance} Km`}
        >
          <View className={userPin({ intent: isCurrentUser ? "user" : null })}>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className={photoUser({ intent: isCurrentUser ? "user" : null })}
              />
            ) : (
              <Image
                source={require("../../assets/user2.png")}
                className="h-[32px] w-[32px] rounded-full"
              />
            )}
          </View>
        </Marker>
      );
    });
  }, [
    usersParticipants,
    userConfig,
    routeData,
    routeCoordinates,
    markersReady,
  ]);

  // Map Controls
  const toggleMapType = useCallback(() => {
    setMapType((prev) => {
      switch (prev) {
        case "standard":
          return "satellite";
        case "satellite":
          return "hybrid";
        default:
          return "standard";
      }
    });
  }, []);

  const animateCamera = useCallback((cameraParams: Partial<Camera>) => {
    mapRef.current?.animateCamera(cameraParams, {
      duration: ANIMATION_DURATION,
    });
  }, []);

  const adjustTilt = useCallback(
    (delta: number) => {
      const newTilt = Math.max(0, Math.min(tilt + delta, MAX_TILT));
      setTilt(newTilt);
      animateCamera({ pitch: newTilt });
    },
    [tilt, animateCamera]
  );

  const resetCamera = useCallback(() => {
    setTilt(0);
    animateCamera({ pitch: 0, heading: 0 });
    mapRef.current?.fitToCoordinates(routeCoordinates, {
      edgePadding: MAP_EDGE_PADDING,
      animated: true,
    });
  }, [animateCamera, routeCoordinates]);

  const focusOnUser = useCallback(
    (user: UserParticipation) => {
      animateCamera({ center: user.location, pitch: 60, zoom: 16 });
    },
    [animateCamera]
  );

  const navigateBack = useCallback(() => {
    router.push("/dashboard");
  }, []);

  // Render user card
  const renderUserCard = useCallback(
    ({ item }: { item: UserParticipation }) => (
      <TouchableOpacity
        onPress={() => focusOnUser(item)}
        className="p-4 w-[311px] rounded-2xl bg-white"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between">
          <Pressable
            onPress={() => {
              if (item.userId === userConfig?.usersId) {
                router.push("/dashboard");
              } else {
                router.push({
                  pathname: "/profile",
                  params: { userId: item.userId },
                });
              }
            }}
            className="flex-row items-start"
            pointerEvents="box-only"
          >
            {item.avatar ? (
              <ExpoImage
                source={{ uri: item.avatar }}
                style={{ width: 43, height: 43, borderRadius: 100 }}
              />
            ) : (
              <Image
                source={require("../../assets/user2.png")}
                className="h-[43px] w-[43px] rounded-full"
              />
            )}
            <Text className="text-base font-inter-bold ml-2">{item.name}</Text>
          </Pressable>
          <Text className="text-[#707271] text-[12px]">
            {dayjs(item.lastTaskDate).utc().local().fromNow()}
          </Text>
        </View>

        <View className="flex-row w-1/3 h-[37px] items-center justify-between mt-3">
          <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
            <Text className="font-inter-bold">{item.percentage}</Text>
            <Text className="text-[10px] text-bondis-gray-secondary">km</Text>
          </View>
          <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
            <Text className="font-inter-bold">{item.totalTasks}</Text>
            <Text className="text-[10px] text-bondis-gray-secondary">
              ATIVIDADES
            </Text>
          </View>
          <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
            <Text className="font-inter-bold">{item.totalCalories}</Text>
            <Text className="text-[10px] text-bondis-gray-secondary">
              CAL. TOTAIS
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [focusOnUser]
  );

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#12FF55" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
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
        {/* Route Polylines */}
        {routeCoordinates.length > 0 && mapReady && (
          <>
            <Polyline
              key={`route-polyline-${routeCoordinates.length}`}
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={
                Platform.OS === "ios" ? "rgba(0, 0, 0, 1)" : "#000000"
              }
              fillColor={Platform.OS === "ios" ? "rgba(0, 0, 0, 1)" : undefined}
              strokeColors={
                Platform.OS === "ios" ? ["rgba(0, 0, 0, 1)"] : undefined
              }
              zIndex={1}
            />
            <Polyline
              key={`user-path-${getUserPath.length}`}
              coordinates={getUserPath}
              strokeWidth={2}
              strokeColor={
                Platform.OS === "ios" ? "rgba(18, 255, 85, 1)" : "#12FF55"
              }
              fillColor={
                Platform.OS === "ios" ? "rgba(18, 255, 85, 1)" : undefined
              }
              strokeColors={
                Platform.OS === "ios" ? ["rgba(18, 255, 85, 1)"] : undefined
              }
              zIndex={2}
            />
          </>
        )}

        {/* User Markers */}
        {userMarkers}

        {/* Finish Marker */}
        {routeCoordinates.length > 0 && (
          <Marker
            key="final"
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            style={{ zIndex: 40, elevation: 40 }}
            title="Final"
            tracksViewChanges={!markersReady}
          >
            <Image
              source={require("../../assets/final-pin.png")}
              className="h-[40px] w-[40px] rounded-full"
            />
          </Marker>
        )}
      </MapView>

      {/* Control Buttons */}
      <TouchableOpacity
        onPress={navigateBack}
        className="absolute top-[40px] left-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
      >
        <Left />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleMapType}
        className="absolute top-[40px] right-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center px-3"
      >
        <Octicons name="stack" size={16} color="black" />
      </TouchableOpacity>

      {/* Camera Controls */}
      <View className="absolute right-[13px] top-[100px] bg-bondis-text-gray rounded-full overflow-hidden">
        <TouchableOpacity
          onPress={() => adjustTilt(TILT_STEP)}
          className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400"
        >
          <AntDesign name="arrowup" size={16} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => adjustTilt(-TILT_STEP)}
          className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400"
        >
          <AntDesign name="arrowdown" size={16} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={resetCamera}
          className="h-[40px] w-[40px] justify-center items-center"
        >
          <AntDesign name="reload1" size={16} color="black" />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View className="absolute w-full bottom-[22.5%] items-center">
        <FlatList
          data={usersParticipants}
          keyExtractor={(item) => item.userId}
          renderItem={renderUserCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Bottom Sheet */}
      <RankingBottomSheet
        routeData={routeData}
        userProgress={userProgress}
        userDistance={userDistance}
        userData={userConfig}
      />

      <SystemBars style="dark" />
    </View>
  );
}
