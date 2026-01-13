export interface TasksGetTasksParams {
  inscriptionId: number;
}

export interface TasksGetTasksItem {
  id: number;
  name: string;
  environment: string;
  date: string;
  duration: number;
  calories: number | null;
  local: string | null;
  distanceKm: string;
  inscriptionId: number;
  usersId: string;
  gpsTask: boolean;
}

export type TasksGetTasksResponse = TasksGetTasksItem[];
