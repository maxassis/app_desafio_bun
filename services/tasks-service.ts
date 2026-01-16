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
