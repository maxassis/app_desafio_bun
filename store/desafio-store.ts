import { create } from 'zustand';

interface Task {
  id: number;
  name: string;
  environment: string;
  date: null | Date;
  duration: number;
  calories: number | null;
  local: null | string;
  distanceKm: string;
  inscriptionId: number;
  usersId: string;
}

interface DesafioStore {
  inscriptionId: number | null;
  desafioName: string | null;
  taskData: Task | null;
  distanceTotal: number;
  progress: number;
  desafioId: number | null;
  setDesafioData: (participationId: number, desafioName: string, progress: number, distanceTotal: number, desafioId: number) => void;
  setTaskData: (taskData: Task) => void;
  clearDesafioData: () => void;
  clearTaskData: () => void;
  setMapData: (
    desafioId: number,
    inscriptionId: number,
  ) => void;
  totalDuration: number;
  taskCount: number; 
  progressPercentage: number,
}

const useDesafioStore = create<DesafioStore>((set) => ({
  inscriptionId: null,
  desafioName: null,
  taskData: null,
  distance: 0,
  distanceTotal: 0,
  progress: 0,
  desafioId: null,
  totalDuration: 0,
  taskCount: 0,
  progressPercentage: 0,
  setMapData: (desafioId, inscriptionId) =>
    set({ desafioId, inscriptionId }),
  setDesafioData: (inscriptionId, desafioName, progress ,distanceTotal, desafioId ) => 
    set({ inscriptionId, desafioName, progress ,distanceTotal, desafioId }),
  setTaskData: (taskData) =>
    set({ taskData }),
  clearDesafioData: () => 
    set({ inscriptionId: null, desafioName: null }),
  clearTaskData: () =>
    set({ taskData: null })
}));

export default useDesafioStore; 