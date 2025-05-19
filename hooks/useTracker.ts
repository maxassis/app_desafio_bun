// import { useEffect, useRef, useState } from 'react';
// import * as Location from 'expo-location';

// export type SimpleLocation = {
//   latitude: number;
//   longitude: number;
// };

// export type TrackingStatus = 'idle' | 'recording' | 'paused' | 'finished';

// export default function useTracker() {
//   const [status, setStatus] = useState<TrackingStatus>('idle');
//   const [locations, setLocations] = useState<SimpleLocation[]>([]);
//   const [distance, setDistance] = useState(0);
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [pauseTime, setPauseTime] = useState<number | null>(null);
//   const [elapsed, setElapsed] = useState(0); // seconds
//   const locationSubscription = useRef<Location.LocationSubscription | null>(null);



//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Permissão negada para acessar localização');
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;
//     if (status === 'recording') {
//       timer = setInterval(() => {
//         if (startTime) {
//           setElapsed(Math.floor((Date.now() - startTime) / 1000));
//         }
//       }, 1000);
//     }
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [status, startTime]);

//   const startTracking = async () => {
//     setStatus('recording');
//     setLocations([]);
//     setDistance(0);
//     const now = Date.now();
//     setStartTime(now);
//     setElapsed(0);

//     locationSubscription.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 2000,
//         distanceInterval: 5,
//       },
//       (location) => {
//         const newPoint = {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         };

//         console.log('Nova coordenada:', newPoint);

//         setLocations((prev) => {
//           if (prev.length > 0) {
//             const last = prev[prev.length - 1];
//             const d = getDistanceFromLatLonInKm(last.latitude, last.longitude, newPoint.latitude, newPoint.longitude);
//             setDistance((total) => total + d);
//           }
//           return [...prev, newPoint];
//         });
//       }
//     );
//   };

//   const pauseTracking = () => {
//     locationSubscription.current?.remove();
//     locationSubscription.current = null;
//     setPauseTime(Date.now());
//     setStatus('paused');
//   };

//   const resumeTracking = async () => {
//     setStatus('recording');
//     if (pauseTime && startTime) {
//       const pausedDuration = Date.now() - pauseTime;
//       setStartTime((prev) => (prev ? prev + pausedDuration : null));
//     }

//     locationSubscription.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 2000,
//         distanceInterval: 5,
//       },
//       (location) => {
//         const newPoint = {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         };

//         setLocations((prev) => {
//           if (prev.length > 0) {
//             const last = prev[prev.length - 1];
//             const d = getDistanceFromLatLonInKm(last.latitude, last.longitude, newPoint.latitude, newPoint.longitude);
//             setDistance((total) => total + d);
//           }
//           return [...prev, newPoint];
//         });
//       }
//     );
//   };

//   const stopTracking = () => {
//     locationSubscription.current?.remove();
//     locationSubscription.current = null;
//     setStatus('finished');
//   };

//   const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371;
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const deg2rad = (deg: number) => deg * (Math.PI / 180);

//   return {
//     status,
//     elapsed,
//     distance,
//     startTracking,
//     pauseTracking,
//     resumeTracking,
//     stopTracking,
//   };
// }

// import { useEffect, useRef, useState } from 'react';
// import * as Location from 'expo-location';

// export type SimpleLocation = {
//   latitude: number;
//   longitude: number;
// };

// export type TrackingStatus = 'idle' | 'recording' | 'paused' | 'finished';

// export default function useTracker() {
//   const [status, setStatus] = useState<TrackingStatus>('idle');
//   const [locations, setLocations] = useState<SimpleLocation[]>([]);
//   const [distance, setDistance] = useState(0);
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [pauseTime, setPauseTime] = useState<number | null>(null);
//   const [elapsed, setElapsed] = useState(0); // seconds
//   const locationSubscription = useRef<Location.LocationSubscription | null>(null);

//   const MIN_DISTANCE_KM = 0.01; // 10 metros
//   const MIN_SPEED_KMH = 0.5;    // mínimo para considerar movimento
//   const MAX_ACCURACY_METERS = 25; // máximo aceitável de imprecisão

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Permissão negada para acessar localização');
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;
//     if (status === 'recording') {
//       timer = setInterval(() => {
//         if (startTime) {
//           setElapsed(Math.floor((Date.now() - startTime) / 1000));
//         }
//       }, 1000);
//     }
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [status, startTime]);

//   const handleLocationUpdate = (location: Location.LocationObject) => {
//     const { latitude, longitude, speed, accuracy } = location.coords;

//     // Verificações de qualidade
//     if (accuracy > MAX_ACCURACY_METERS) return; // Ignora pontos imprecisos
//     if (speed !== null && speed * 3.6 < MIN_SPEED_KMH) return; // Ignora velocidades baixas

//     const newPoint = { latitude, longitude };

//     setLocations((prev) => {
//       if (prev.length > 0) {
//         const last = prev[prev.length - 1];
//         const d = getDistanceFromLatLonInKm(last.latitude, last.longitude, latitude, longitude);

//         if (d < MIN_DISTANCE_KM) return prev; // Ignora distâncias pequenas

//         setDistance((total) => total + d);
//       }

//       return [...prev, newPoint];
//     });
//   };

//   const startTracking = async () => {
//     setStatus('recording');
//     setLocations([]);
//     setDistance(0);
//     const now = Date.now();
//     setStartTime(now);
//     setElapsed(0);

//     locationSubscription.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 2000,
//         distanceInterval: 5,
//       },
//       handleLocationUpdate
//     );
//   };

//   const pauseTracking = () => {
//     locationSubscription.current?.remove();
//     locationSubscription.current = null;
//     setPauseTime(Date.now());
//     setStatus('paused');
//   };

//   const resumeTracking = async () => {
//     setStatus('recording');

//     if (pauseTime && startTime) {
//       const pausedDuration = Date.now() - pauseTime;
//       setStartTime((prev) => (prev ? prev + pausedDuration : null));
//     }

//     locationSubscription.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.Highest,
//         timeInterval: 2000,
//         distanceInterval: 5,
//       },
//       handleLocationUpdate
//     );
//   };

//   const stopTracking = () => {
//     locationSubscription.current?.remove();
//     locationSubscription.current = null;
//     setStatus('finished');
//   };

//   const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371;
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const deg2rad = (deg: number) => deg * (Math.PI / 180);

//   return {
//     status,
//     elapsed,
//     distance,
//     startTracking,
//     pauseTracking,
//     resumeTracking,
//     stopTracking,
//   };
// }

import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type SimpleLocation = {
  latitude: number;
  longitude: number;
};

export type TrackingStatus = 'idle' | 'recording' | 'paused' | 'finished';

// Kalman Filter para suavizar latitude e longitude
class KalmanFilter2D {
  private lat: number | null = null;
  private lon: number | null = null;
  private P_lat = 1;
  private P_lon = 1;
  private readonly R: number;
  private readonly Q: number;

  constructor(processNoise = 0.00001, measurementNoise = 0.0001) {
    this.R = measurementNoise;
    this.Q = processNoise;
  }

  filter(lat: number, lon: number) {
    if (this.lat === null || this.lon === null) {
      this.lat = lat;
      this.lon = lon;
      return { latitude: lat, longitude: lon };
    }

    const K_lat = this.P_lat / (this.P_lat + this.R);
    const K_lon = this.P_lon / (this.P_lon + this.R);

    this.lat += K_lat * (lat - this.lat);
    this.lon += K_lon * (lon - this.lon);

    this.P_lat = (1 - K_lat) * this.P_lat + this.Q;
    this.P_lon = (1 - K_lon) * this.P_lon + this.Q;

    return { latitude: this.lat, longitude: this.lon };
  }
}

export default function useTracker() {
  const [status, setStatus] = useState<TrackingStatus>('paused');
  const [locations, setLocations] = useState<SimpleLocation[]>([]);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const kalman = useRef(new KalmanFilter2D()).current;

  // Filtros
  const MIN_DISTANCE_KM = 0.01; // 10 metros
  const MIN_SPEED_KMH = 0.5;    // Desconsiderar velocidades muito baixas
  const MAX_ACCURACY_METERS = 25;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão negada para acessar localização');
      }
    })();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (status === 'recording') {
      timer = setInterval(() => {
        if (startTime) {
          setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, startTime]);

  const processLocation = (location: Location.LocationObject) => {
    const { latitude, longitude, accuracy, speed } = location.coords;

    if (accuracy! > MAX_ACCURACY_METERS) return;
    if (speed !== null && speed * 3.6 < MIN_SPEED_KMH) return;

    const smoothed = kalman.filter(latitude, longitude);

    setLocations((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const d = getDistanceFromLatLonInKm(last.latitude, last.longitude, smoothed.latitude, smoothed.longitude);
        const timeDiff = 2 / 3600; // 2 segundos = 2/3600 horas
        const speedKmh = d / timeDiff;

        if (d >= MIN_DISTANCE_KM && speedKmh >= MIN_SPEED_KMH) {
          setDistance((total) => total + d);
          return [...prev, smoothed];
        }

        return prev;
      }

      return [smoothed];
    });
  };

  const startTracking = async () => {
    setStatus('recording');
    setLocations([]);
    setDistance(0);
    setElapsed(0);
    setStartTime(Date.now());

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      processLocation
    );
  };

  const pauseTracking = () => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    setPauseTime(Date.now());
    setStatus('paused');
  };

  const resumeTracking = async () => {
    setStatus('recording');
    if (pauseTime && startTime) {
      const pausedDuration = Date.now() - pauseTime;
      setStartTime((prev) => (prev ? prev + pausedDuration : null));
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      processLocation
    );
  };

  const stopTracking = () => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    setStatus('finished');
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  return {
    status,
    elapsed,
    distance,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
  };
}
