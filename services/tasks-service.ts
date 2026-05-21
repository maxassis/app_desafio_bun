import type { StravaActivity } from "@/@types/strava-activities";
import type { TasksGetResponse } from "../@types/tasks-get-tasks";
import { apiClient, getErrorMessage } from "./api-client";

export const fetchTasks = async (
  inscriptionId: number
): Promise<TasksGetResponse> => {
  try {
    const { data } = await apiClient.get<TasksGetResponse>(
      `/tasks/get-tasks/${inscriptionId}`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch tasks"));
  }
};

export const deleteTask = async (id: number) => {
  try {
    const { data } = await apiClient.delete<{ message?: string }>(
      `/tasks/delete-task/${id}`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete task"));
  }
};

export const importStravaActivities = async (
  inscriptionId: number,
  activities: StravaActivity[],
) => {
  try {
    const payload = {
      inscriptionId,
      activities: activities.map(a => ({
        stravaActivityId: a.stravaActivityId,
        name: a.name,
        environment: a.environment,
        distance: a.distance,
        duration: a.duration,
        calories: a.calories,
      })),
    };

    const { data } = await apiClient.post('/tasks/import-strava', payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to import Strava activities"));
  }
};
