import type { TasksCheckCompletionRequest, TasksCheckCompletionResponse } from "../@types/tasks-check-completion";
import type { TasksCreateRequest, TasksCreateResponse } from "../@types/tasks-create";
import type { TasksGetResponse } from "../@types/tasks-get-tasks";
import type {
  TasksUpdateTaskParams,
  TasksUpdateTaskRequest,
  TasksUpdateTaskResponse,
} from "../@types/tasks-update-task";
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

export const createTask = async (
  payload: TasksCreateRequest
): Promise<TasksCreateResponse> => {
  try {
    const { data } = await apiClient.post<TasksCreateResponse>(
      "/tasks/create",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao criar tarefa"));
  }
};

export const updateTask = async (
  params: TasksUpdateTaskParams,
  payload: TasksUpdateTaskRequest
): Promise<TasksUpdateTaskResponse> => {
  try {
    const { data } = await apiClient.patch<TasksUpdateTaskResponse>(
      `/tasks/update-task/${params.id}`,
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha ao atualizar tarefa"));
  }
};

export const checkCompletion = async (
  payload: TasksCheckCompletionRequest
): Promise<TasksCheckCompletionResponse> => {
  try {
    const { data } = await apiClient.post<TasksCheckCompletionResponse>(
      "/tasks/check-completion",
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Erro ao verificar conclusão"));
  }
};
