// import { useState, useEffect, useRef } from "react";
// import {
//   watchPositionAsync,
//   Accuracy,
//   LocationObject,
//   reverseGeocodeAsync,
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

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (status === "recording") {
//       timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [status]);

//   async function getCityFromCoords(latitude: number, longitude: number) {
//     try {
//       const results = await reverseGeocodeAsync({ latitude, longitude });
//       if (results.length > 0) {
//         const locationInfo = results[0];
//         setCity(locationInfo.city || locationInfo.subregion || null);
//       }
//     } catch (error) {
//       console.error("Erro ao obter cidade:", error);
//     }
//   }

//   async function startTracking() {
//     setStatus("recording");
//     setElapsed(0);
//     setDistance(0);
//     kalman.current.reset();
//     lastLocation.current = null;

//     watcher.current = await watchPositionAsync(
//       {
//         accuracy: Accuracy.High,
//         timeInterval: 1000,
//         distanceInterval: 1,
//       },
//       async (location) => {
//         const { latitude, longitude } = location.coords;
//         const filtered = kalman.current.filtrar(latitude, longitude);

//         if (lastLocation.current) {
//           const d = calcularDistanciaKm(
//             lastLocation.current.coords.latitude,
//             lastLocation.current.coords.longitude,
//             filtered.latitude,
//             filtered.longitude
//           );
//           setDistance((prev) => prev + d);
//         }

//         lastLocation.current = {
//           ...location,
//           coords: {
//             ...location.coords,
//             latitude: filtered.latitude,
//             longitude: filtered.longitude,
//           },
//         };

//         // Pega cidade apenas uma vez (ou quando estiver vazia)
//         if (!city) {
//           await getCityFromCoords(filtered.latitude, filtered.longitude);
//         }
//       }
//     );
//   }

//   function pauseTracking() {
//     setStatus("paused");
//     watcher.current?.remove();
//   }

//   function resumeTracking() {
//     setStatus("recording");
//     startTracking();
//   }

//   function stopTracking() {
//     setStatus("idle");
//     watcher.current?.remove();
//     watcher.current = null;
//   }

//   // console.log(city,elapsed, distance);

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
} from "expo-location";
import { KalmanLatitudeLongitude } from '@/utils/gpsFunctions';
import { haversine as calcularDistanciaKm } from '@/utils/gpsFunctions';

type Status = "idle" | "recording" | "paused";

export default function useTracker() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [city, setCity] = useState<string | null>(null);

  const kalman = useRef(new KalmanLatitudeLongitude({ R: 0.0001 }));
  const lastLocation = useRef<LocationObject | null>(null);
  const watcher = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "recording") {
      timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  async function getCityFromCoords(latitude: number, longitude: number) {
    try {
      const results = await reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const locationInfo = results[0];
        setCity(locationInfo.city || locationInfo.subregion || null);
      }
    } catch (error) {
      console.error("Erro ao obter cidade:", error);
    }
  }

  async function startTracking() {
    // Only reset values if we're starting fresh, not resuming
    if (status === "idle") {
      setElapsed(0);
      setDistance(0);
      kalman.current.reset();
      lastLocation.current = null;
    }
    
    setStatus("recording");

    watcher.current = await watchPositionAsync(
      {
        accuracy: Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        const filtered = kalman.current.filtrar(latitude, longitude);

        if (lastLocation.current) {
          const d = calcularDistanciaKm(
            lastLocation.current.coords.latitude,
            lastLocation.current.coords.longitude,
            filtered.latitude,
            filtered.longitude
          );
          setDistance((prev) => prev + d);
        }

        lastLocation.current = {
          ...location,
          coords: {
            ...location.coords,
            latitude: filtered.latitude,
            longitude: filtered.longitude,
          },
        };

        // Pega cidade apenas uma vez (ou quando estiver vazia)
        if (!city) {
          await getCityFromCoords(filtered.latitude, filtered.longitude);
        }
      }
    );
  }

  function pauseTracking() {
    setStatus("paused");
    watcher.current?.remove();
  }

  function resumeTracking() {
    // Just restart the watcher without resetting values
    startTracking();
  }

  function stopTracking() {
    setStatus("idle");
    watcher.current?.remove();
    watcher.current = null;
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