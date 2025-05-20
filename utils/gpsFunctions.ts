export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


type KalmanOptions = {
  R: number; // variância do ruído do processo
};

export class KalmanLatitudeLongitude {
  private R: number;
  private x: number[] | null = null;
  private P: number[][] | null = null;

  constructor(options: KalmanOptions) {
    this.R = options.R;
  }

  reset() {
    this.x = null;
    this.P = null;
  }

  filtrar(latitude: number, longitude: number): { latitude: number; longitude: number } {
    const z = [latitude, longitude];

    if (!this.x) {
      this.x = [...z];
      this.P = [
        [1, 0],
        [0, 1],
      ];
      return { latitude, longitude };
    }

    const x = this.x;
    const P = this.P!;

    const H = [
      [1, 0],
      [0, 1],
    ];

    const y = [z[0] - x[0], z[1] - x[1]];

    const S = [
      [P[0][0] + this.R, P[0][1]],
      [P[1][0], P[1][1] + this.R],
    ];

    const K = [
      [P[0][0] / S[0][0], P[0][1] / S[1][1]],
      [P[1][0] / S[0][0], P[1][1] / S[1][1]],
    ];

    this.x = [
      x[0] + K[0][0] * y[0] + K[0][1] * y[1],
      x[1] + K[1][0] * y[0] + K[1][1] * y[1],
    ];

    this.P = [
      [P[0][0] - K[0][0] * P[0][0], P[0][1] - K[0][1] * P[0][1]],
      [P[1][0] - K[1][0] * P[1][0], P[1][1] - K[1][1] * P[1][1]],
    ];

    return { latitude: this.x[0], longitude: this.x[1] };
  }
}
