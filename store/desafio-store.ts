import { createWithEqualityFn as create } from 'zustand/traditional';

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
  gpsTask: boolean;
}

// Você pode ajustar essa interface para que corresponda à estrutura real do seu objeto "desafio"
interface Desafio {
  id: any;
  name: string;
  // Adicione outros campos que seu objeto desafio possa ter
}

interface DesafioStore {
  inscriptionId: number | null;
  desafioName: string | null;
  taskData: Task | null;
  distanceTotal: number;
  progress: number;
  desafioId: string | null;
  desafioSelecionado: Desafio | null; // Para passar o desafio para a tela de criação de task
  setDesafioData: (participationId: number, desafioName: string, progress: number, distanceTotal: number, desafioId: string) => void;
  setTaskData: (taskData: Task) => void;
  clearDesafioData: () => void;
  clearTaskData: () => void;
  setMapData: (
    desafioId: string,
    inscriptionId: number,
  ) => void;
  setDesafioSelecionado: (desafio: Desafio | null) => void;
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
  desafioSelecionado: null,
  totalDuration: 0,
  taskCount: 0,
  progressPercentage: 0,
  setMapData: (desafioId, inscriptionId) =>
    set({ desafioId, inscriptionId }),
  setDesafioData: (inscriptionId, desafioName, progress ,distanceTotal, desafioId ) => 
    set({ inscriptionId, desafioName, progress ,distanceTotal, desafioId }),
  setTaskData: (taskData) =>
    set({ taskData }),
  setDesafioSelecionado: (desafio) => set({ desafioSelecionado: desafio }),
  clearDesafioData: () => 
    set({ inscriptionId: null, desafioName: null }),
  clearTaskData: () =>
    set({ taskData: null })
}));

export default useDesafioStore; 