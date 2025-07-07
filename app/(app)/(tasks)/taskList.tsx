import { useState, useRef, useMemo, useEffect } from "react";
import tokenExists from "../../../store/auth-store";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import Left from "../../../assets/Icon-left.svg";
import TaskItem from "../../../components/taskItem";
import TaskItemSkeleton from "@/components/taskItemSkeleton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Plus from "../../../assets/plus.svg";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDesafioStore from "../../../store/desafio-store";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TasksData = Data[];
export interface Data {
  id: number;
  name: string;
  environment: string;
  date: Date;
  duration: number;
  calories: number | null;
  local: null | string;
  distanceKm: string;
  inscriptionId: number;
  usersId: string;
  gpsTask: boolean;
}

const fetchTasks = async (
  inscriptionId: number,
  token: string
): Promise<TasksData> => {
  const res = await fetch(
    `https://bondis-app-backend.onrender.com/tasks/get-tasks/${inscriptionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.json();
};

const deleteTaskApi = async (id: number, token: string) => {
  const res = await fetch(
    `https://bondis-app-backend.onrender.com/tasks/delete-task/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export default function TaskList() {
  const { inscriptionId, desafioName, setTaskData, desafioId } =
    useDesafioStore();

  const token = tokenExists((state) => state.token);
  const [task, setTask] = useState<Data>();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetEditRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const snapPoints = useMemo(() => ["30%"], []);
  const snapPointsEdit = useMemo(() => ["20%"], []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", inscriptionId],
    queryFn: () => fetchTasks(inscriptionId as number, token!),
    enabled: !!inscriptionId && !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTaskApi(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", inscriptionId] });
      queryClient.invalidateQueries({ queryKey: ["desafios"] });
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
      queryClient.refetchQueries({ queryKey: ["getAllDesafios"] });
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });
      closeAllSheets();
    },
    onError: () => {
      Alert.alert("Erro ao excluir tarefa", "", [
        { text: "Ok", style: "cancel" },
      ]);
    },
  });

  const closeAllSheets = () => {
    bottomSheetRef.current?.close();
    bottomSheetEditRef.current?.close();
    setIsBottomSheetOpen(false);
    setIsEditSheetOpen(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (isBottomSheetOpen || isEditSheetOpen) {
        closeAllSheets();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isBottomSheetOpen, isEditSheetOpen]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmação de Exclusão",
      "Tem certeza que deseja excluir esta atividade?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (taskData: Data) => {
    setTask(taskData);
    bottomSheetEditRef.current?.expand();
  };

  const renderTasks = () => {
    if (isLoading) {
      return [...Array(3)].map((_, index) => <TaskItemSkeleton key={index} />);
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text>Erro ao carregar tarefas</Text>
        </View>
      );
    }

    if (data?.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <Text>Nenhuma atividade criada</Text>
        </View>
      );
    }

    return data?.map((task) => (
      <TaskItem key={task.id} task={task} openModalEdit={handleEdit} />
    ));
  };

  return (
    <View className="flex-1 bg-[#F1F1F1]"  style={{ paddingTop: insets.top }}>
      <ScrollView overScrollMode="never">
        <View className="bg-white mb-7">
          <View className="flex-row mt-[29.5] px-5">
            <TouchableOpacity
              className="w-[30px] h-[30px]"
              onPress={() => router.replace("/map")}
            >
              <Left />
            </TouchableOpacity>
            <Text className="text-base font-inter-bold mx-auto">
              Atividades recentes
            </Text>
          </View>

          <View className="h-[60px] mt-4 pt-2 px-5 mb-7">
            <Text className="text-sm text-bondis-gray-secondary">Desafio</Text>
            <Text className="text-base font-inter-bold mt-2">
              {desafioName}
            </Text>
          </View>
        </View>

        {renderTasks()}
      </ScrollView>

      {/* Botão flutuante */}
      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.expand()}
        className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-4 bottom-6"
      >
        <Plus />
      </TouchableOpacity>

      {/* Bottom Sheet - Adicionar */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        onChange={(index) => setIsBottomSheetOpen(index !== -1)}
        backgroundStyle={{ borderRadius: 20 }}
      >
        <BottomSheetView className="flex-1">
          <Text className="font-inter-bold mt-[10px] text-base mx-5 mb-4">
            Adicione uma atividade
          </Text>
          <View className="mx-5">
            {["Via Strava", "Via Apple Saúde"].map((title, idx) => (
              <View
                key={idx}
                className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
              >
                <Text>{title}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => {
                if (task) setTaskData(task);
                bottomSheetRef.current?.close();
                router.push("/createTask");
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Cadastrar manualmente</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Bottom Sheet - Editar/Excluir */}
      <BottomSheet
        ref={bottomSheetEditRef}
        snapPoints={snapPointsEdit}
        index={-1}
        enablePanDownToClose
        onChange={(index) => setIsEditSheetOpen(index !== -1)}
        backgroundStyle={{ borderRadius: 20 }}
      >
        <BottomSheetView className="flex-1">
          <View className="mx-5">
            <TouchableOpacity
              onPress={() => {
                if (task) {
                  setTaskData(task);
                  bottomSheetEditRef.current?.close();
                  router.push(task.gpsTask ? "/taskEditGps" : "/taskEdit");
                }
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Editar atividade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(task!.id)}
              className="h-[51px] justify-center items-center"
            >
              <Text className="text-bondis-alert-red">Excluir atividade</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <SystemBars style="dark" />
    </View>
  );
}
