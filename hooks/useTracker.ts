// import { useState, useEffect, useRef } from "react";
// import {
//   watchPositionAsync,
//   Accuracy,
//   LocationObject,
//   reverseGeocodeAsync,
//   requestForegroundPermissionsAsync,
//   PermissionStatus
// } from "expo-location";
// import { KalmanLatitudeLongitude } from '@/utils/gpsFunctions';
// import { haversine as calcularDistanciaKm } from '@/utils/gpsFunctions';

// type Status = "idle" | "recording" | "paused";

// export default function useTracker() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [elapsed, setElapsed] = useState(0);
//   const [distance, setDistance] = useState(0);
//   const [city, setCity] = useState<string | null>(null);

//   const kalman = useRef(new KalmanLatitudeLongitude({ R: 0.0001 }));
//   const lastLocation = useRef<LocationObject | null>(null);
//   const watcher = useRef<any>(null);

//   const startTime = useRef<number | null>(null);
//   const pausedTime = useRef<number>(0);

//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;

//     if (status === "recording") {
//       timer = setInterval(() => {
//         if (startTime.current) {
//           const now = Date.now();
//           const diffInSeconds = Math.floor((now - startTime.current - pausedTime.current) / 1000);
//           setElapsed(diffInSeconds);
//         }
//       }, 1000);
//     }

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [status]);

//   async function getCityFromCoords(latitude: number, longitude: number) {
//     try {
//       const results = await reverseGeocodeAsync({ latitude, longitude });
//       if (results.length > 0) {
//         const locationInfo = results[0];
//         const detectedCity = locationInfo.city || locationInfo.subregion || null;
//         setCity(detectedCity);
//         console.log("Cidade detectada:", detectedCity);
//       }
//     } catch (error) {
//       console.error("Erro ao obter cidade:", error);
//     }
//   }

//   async function startTracking() {
//     console.log("Solicitando permissão de localização...");
//     const { status: permissionStatus } = await requestForegroundPermissionsAsync();

//     console.log("Status da permissão:", permissionStatus);

//     if (permissionStatus !== PermissionStatus.GRANTED) {
//       console.warn("Permissão de localização não concedida.");
//       return;
//     }

//     console.log("Iniciando tracking...");

//     if (status === "idle") {
//       setElapsed(0);
//       setDistance(0);
//       kalman.current.reset();
//       lastLocation.current = null;
//       pausedTime.current = 0;
//       startTime.current = Date.now();
//     }

//     setStatus("recording");

//     if (!watcher.current) {
//       watcher.current = await watchPositionAsync(
//         {
//           accuracy: Accuracy.High,
//           timeInterval: 1000,
//           distanceInterval: 1,
//         },
//         async (location) => {
//           const { latitude, longitude } = location.coords;
//           console.log("Nova posição:", latitude, longitude);

//           const filtered = kalman.current.filtrar(latitude, longitude);

//           if (lastLocation.current) {
//             const d = calcularDistanciaKm(
//               lastLocation.current.coords.latitude,
//               lastLocation.current.coords.longitude,
//               filtered.latitude,
//               filtered.longitude
//             );
//             setDistance((prev) => {
//               const newDistance = prev + d;
//               console.log("Distância acumulada:", newDistance.toFixed(3), "km");
//               return newDistance;
//             });
//           }

//           lastLocation.current = {
//             ...location,
//             coords: {
//               ...location.coords,
//               latitude: filtered.latitude,
//               longitude: filtered.longitude,
//             },
//           };

//           if (!city) {
//             await getCityFromCoords(filtered.latitude, filtered.longitude);
//           }
//         }
//       );
//     }
//   }

//   function pauseTracking() {
//     if (status === "recording") {
//       console.log("Pausando tracking...");
//       setStatus("paused");
//       if (startTime.current) {
//         pausedTime.current += Date.now() - (startTime.current + pausedTime.current + elapsed * 1000);
//       }
//       watcher.current?.remove();
//       watcher.current = null;
//     }
//   }

//   async function resumeTracking() {
//     if (status === "paused") {
//       console.log("Retomando tracking...");
//       setStatus("recording");
//       startTracking();
//     }
//   }

//   function stopTracking() {
//     console.log("Parando tracking...");
//     setStatus("idle");
//     watcher.current?.remove();
//     watcher.current = null;
//     startTime.current = null;
//     pausedTime.current = 0;
//     lastLocation.current = null;
//     kalman.current.reset();
//   }

//   // console.log("Status:", status, "| Tempo decorrido:", elapsed, "s | Distância:", distance.toFixed(3), "km");

//   return {
//     status,
//     elapsed,
//     distance,
//     city,
//     startTracking,
//     pauseTracking,
//     resumeTracking,
//     stopTracking,
//   };
// }

// import { useState, useEffect, useRef } from "react";
// import {
//   watchPositionAsync,
//   Accuracy,
//   LocationObject,
//   reverseGeocodeAsync,
//   requestForegroundPermissionsAsync,
//   PermissionStatus
// } from "expo-location";
// import { KalmanLatitudeLongitude } from '@/utils/gpsFunctions';
// import { haversine as calcularDistanciaKm } from '@/utils/gpsFunctions';
// import { useTrackerStore } from '@/store/rastreador-store';

// type Status = "idle" | "recording" | "paused";

// export default function useTracker() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [elapsed, setElapsed] = useState(0);
//   const [distance, setDistance] = useState(0);
//   const [city, setCity] = useState<string | null>(null);

//   const { setDistanceStore, setElapsedStore, setCityStore, reset: resetStore } = useTrackerStore();

//   const kalman = useRef(new KalmanLatitudeLongitude({ R: 0.0001 }));
//   const lastLocation = useRef<LocationObject | null>(null);
//   const watcher = useRef<any>(null);

//   const startTime = useRef<number | null>(null);
//   const pausedTime = useRef<number>(0);

//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;

//     if (status === "recording") {
//       timer = setInterval(() => {
//         if (startTime.current) {
//           const now = Date.now();
//           const diffInSeconds = Math.floor((now - startTime.current - pausedTime.current) / 1000);
//           setElapsed(diffInSeconds);
//         }
//       }, 1000);
//     }

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [status]);

//   async function getCityFromCoords(latitude: number, longitude: number) {
//     try {
//       const results = await reverseGeocodeAsync({ latitude, longitude });
//       if (results.length > 0) {
//         const locationInfo = results[0];
//         const detectedCity = locationInfo.city || locationInfo.subregion || null;
//         setCity(detectedCity);
//         console.log("Cidade detectada:", detectedCity);
//       }
//     } catch (error) {
//       console.error("Erro ao obter cidade:", error);
//     }
//   }

//   async function startTracking() {
//     console.log("Solicitando permissão de localização...");
//     const { status: permissionStatus } = await requestForegroundPermissionsAsync();

//     console.log("Status da permissão:", permissionStatus);

//     if (permissionStatus !== PermissionStatus.GRANTED) {
//       console.warn("Permissão de localização não concedida.");
//       return;
//     }

//     console.log("Iniciando tracking...");

//     if (status === "idle") {
//       setElapsed(0);
//       setDistance(0);
//       kalman.current.reset();
//       lastLocation.current = null;
//       pausedTime.current = 0;
//       startTime.current = Date.now();
//       setCity(null);
//     }

//     setStatus("recording");

//     if (!watcher.current) {
//       watcher.current = await watchPositionAsync(
//         {
//           accuracy: Accuracy.High,
//           timeInterval: 1000,
//           distanceInterval: 1,
//         },
//         async (location) => {
//           const { latitude, longitude } = location.coords;
//           console.log("Nova posição:", latitude, longitude);

//           const filtered = kalman.current.filtrar(latitude, longitude);

//           if (lastLocation.current) {
//             const d = calcularDistanciaKm(
//               lastLocation.current.coords.latitude,
//               lastLocation.current.coords.longitude,
//               filtered.latitude,
//               filtered.longitude
//             );
//             setDistance((prev) => {
//               const newDistance = prev + d;
//               console.log("Distância acumulada:", newDistance.toFixed(3), "km");
//               return newDistance;
//             });
//           }

//           lastLocation.current = {
//             ...location,
//             coords: {
//               ...location.coords,
//               latitude: filtered.latitude,
//               longitude: filtered.longitude,
//             },
//           };

//           if (!city) {
//             await getCityFromCoords(filtered.latitude, filtered.longitude);
//           }
//         }
//       );
//     }
//   }

//   function pauseTracking() {
//     if (status === "recording") {
//       console.log("Pausando tracking...");
//       setStatus("paused");
//       if (startTime.current) {
//         pausedTime.current += Date.now() - (startTime.current + pausedTime.current + elapsed * 1000);
//       }
//       watcher.current?.remove();
//       watcher.current = null;

//       // Salvar na store ao pausar
//       setElapsedStore(elapsed);
//       setDistanceStore(distance);
//       setCityStore(city);
//     }
//   }

//   async function resumeTracking() {
//     if (status === "paused") {
//       console.log("Retomando tracking...");
//       setStatus("recording");
//       startTracking();
//     }
//   }

//   function stopTracking() {
//     console.log("Parando tracking...");
//     setStatus("idle");
//     watcher.current?.remove();
//     watcher.current = null;
//     startTime.current = null;
//     pausedTime.current = 0;
//     lastLocation.current = null;
//     kalman.current.reset();

//     // Salvar na store ao parar
//     setElapsedStore(elapsed);
//     setDistanceStore(distance);
//     setCityStore(city);
//   }

//   return {
//     status,
//     elapsed,
//     distance,
//     city,
//     startTracking,
//     pauseTracking,
//     resumeTracking,
//     stopTracking,
//   };
// }

import { useState, useEffect, useRef } from "react";
import {
  watchPositionAsync,
  Accuracy,
  LocationObject,
  reverseGeocodeAsync,
  requestForegroundPermissionsAsync,
  PermissionStatus
} from "expo-location";
import { KalmanLatitudeLongitude, haversine as calcularDistanciaKm } from '@/utils/gpsFunctions';
import { useTrackerStore } from '@/store/rastreador-store';

type Status = "idle" | "recording" | "paused";

export default function useTracker() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [city, setCity] = useState<string | null>(null);

  const { setDistanceStore, setElapsedStore, setCityStore, reset: resetStore } = useTrackerStore();

  const kalman = useRef(new KalmanLatitudeLongitude({ R: 0.0001 }));
  const lastLocation = useRef<LocationObject | null>(null);
  const watcher = useRef<any>(null);

  const startTime = useRef<number | null>(null);
  const pausedTime = useRef<number>(0);
  const pauseTimestamp = useRef<number | null>(null);

  // Atualiza o tempo decorrido a cada segundo enquanto está gravando
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (status === "recording") {
      timer = setInterval(() => {
        if (startTime.current) {
          const now = Date.now();
          const diffInSeconds = Math.floor((now - startTime.current - pausedTime.current) / 1000);
          setElapsed(diffInSeconds);
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  // Atualiza automaticamente a store sempre que os valores mudarem
  useEffect(() => {
    setElapsedStore(elapsed);
  }, [elapsed]);

  useEffect(() => {
    setDistanceStore(distance);
  }, [distance]);

  useEffect(() => {
    setCityStore(city);
  }, [city]);

  async function getCityFromCoords(latitude: number, longitude: number) {
    try {
      const results = await reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const locationInfo = results[0];
        const detectedCity = locationInfo.city || locationInfo.subregion || null;
        setCity(detectedCity);
        console.log("Cidade detectada:", detectedCity);
      }
    } catch (error) {
      console.error("Erro ao obter cidade:", error);
    }
  }

  async function startWatcher() {
    if (!watcher.current) {
      watcher.current = await watchPositionAsync(
        {
          accuracy: Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          console.log("Nova posição:", latitude, longitude);

          const filtered = kalman.current.filtrar(latitude, longitude);

          if (lastLocation.current) {
            const d = calcularDistanciaKm(
              lastLocation.current.coords.latitude,
              lastLocation.current.coords.longitude,
              filtered.latitude,
              filtered.longitude
            );
            setDistance(prev => {
              const newDistance = prev + d;
              console.log("Distância acumulada:", newDistance.toFixed(3), "km");
              return newDistance;
            });
          }

          lastLocation.current = {
            ...location,
            coords: {
              ...location.coords,
              latitude: filtered.latitude,
              longitude: filtered.longitude,
            },
          };

          if (!city) {
            await getCityFromCoords(filtered.latitude, filtered.longitude);
          }
        }
      );
    }
  }

  async function startTracking() {
    console.log("Solicitando permissão de localização...");
    const { status: permissionStatus } = await requestForegroundPermissionsAsync();
    console.log("Status da permissão:", permissionStatus);

    if (permissionStatus !== PermissionStatus.GRANTED) {
      console.warn("Permissão de localização não concedida.");
      return;
    }

    console.log("Iniciando tracking...");

    if (status === "idle") {
      setElapsed(0);
      setDistance(0);
      kalman.current.reset();
      lastLocation.current = null;
      pausedTime.current = 0;
      pauseTimestamp.current = null;
      startTime.current = Date.now();
      setCity(null);
    }

    setStatus("recording");
    await startWatcher();
  }

  function pauseTracking() {
    if (status === "recording") {
      console.log("Pausando tracking...");
      setStatus("paused");
      pauseTimestamp.current = Date.now();

      if (watcher.current) {
        watcher.current.remove();
        watcher.current = null;
      }
    }
  }

  async function resumeTracking() {
    if (status === "paused") {
      console.log("Retomando tracking...");

      if (pauseTimestamp.current) {
        pausedTime.current += Date.now() - pauseTimestamp.current;
        pauseTimestamp.current = null;
      }

      setStatus("recording");
      await startWatcher();
    }
  }

  function stopTracking() {
    console.log("Parando tracking...");
    setStatus("idle");

    if (watcher.current) {
      watcher.current.remove();
      watcher.current = null;
    }

    startTime.current = null;
    pausedTime.current = 0;
    pauseTimestamp.current = null;
    lastLocation.current = null;
    kalman.current.reset();

    // Resetar a store também, se quiser:
    // resetStore();
  }

  return {
    status,
    elapsed,
    distance,
    city,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
  };
}
