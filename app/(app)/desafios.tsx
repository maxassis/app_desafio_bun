import React, { useEffect, useMemo, useRef } from 'react'
import {
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import { Image } from 'expo-image'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import Left from '../../assets/arrow-left.svg'
import tokenExists from '../../store/auth-store'
import useDesafioStore from '../../store/desafio-store'
import type { AllDesafios } from '../../utils/api-service'
import { fetchAllDesafios } from '../../utils/api-service'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

export default function DesafioSelect() {
  const token = tokenExists(state => state.token)
  const setDesafioData = useDesafioStore(state => state.setDesafioData)
  const setDesafioSelecionado = useDesafioStore(state => state.setDesafioSelecionado)
  const { gps } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['33%'], [])

  const {
    data: desafios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getAllDesafios'],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  })

  // console.log(desafios)

  const desafiosFiltrados
    = desafios?.filter(
      item => item.completed === false && item.isRegistered === true,
    ) || []

  // 🔙 Corrige o problema de "voltar nativo" não funcionar
  useEffect(() => {
    const backAction = () => {
      if (gps) {
        bottomSheetRef.current?.expand()
      }
      else {
        router.back()
      }
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    )

    return () => backHandler.remove()
  }, [gps])

  const handleDesafioPress = (item: AllDesafios) => {
    // Guarda todo o objeto do desafio no store para a próxima tela usar
    setDesafioSelecionado(item)

    // Mantendo essa chamada caso outra parte do app a utilize
    setDesafioData(
      item.inscriptionId,
      item.name,
      +item.progressPercentage,
      +item.distance,
      item.id,
    )

    if (gps === 'true') {
      router.push({
        pathname: '/createTaskGps',
        params: {
          inscriptionId: item.inscriptionId,
          desafioId: item.id,
        },
      })
    }
    else {
      router.push('/createTask')
    }
  }

  return (
    <View
      className="bg-white flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <SystemBars style="dark" />
      <View className="pt-[28px] px-5 flex-1">
        {!gps && (
          <TouchableOpacity
            onPress={() => router.push('/dashboard')}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center mb-[10px]"
          >
            <Left />
          </TouchableOpacity>
        )}

        <Text
          className={`text-2xl font-anton-regular mt-7 ${
            gps === 'true' ? '' : 'mb-7'
          }`}
        >
          Escolha um desafio
        </Text>

        {gps === 'true' && (
          <>
            <Text className="text-base text-bondis-gray-dark mt-4">
              Você possui
              {' '}
              <Text className="font-inter-bold">{desafiosFiltrados.length}</Text>
              {' '}
              desafios ativos!
            </Text>
            <Text className="text-base text-bondis-gray-dark mb-7">
              Escolha em qual deles deseja cadastrar sua atividade.
            </Text>
          </>
        )}

        {isLoading && (
          <Text className="text-center text-gray-500 mt-10">
            Carregando desafios...
          </Text>
        )}

        {error && (
          <Text className="text-center text-red-500 mt-10">
            Erro ao carregar desafios.
          </Text>
        )}

        {!isLoading && desafiosFiltrados.length === 0 && (
          <Text className="text-center text-gray-500 mt-10">
            Nenhum desafio disponível no momento.
          </Text>
        )}

        {desafiosFiltrados.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleDesafioPress(item)}
            className="h-[94px] flex-row items-center px-3 py-[15px] border-b border-[#D9D9D9]"
          >
            <Image
              source={{ uri: item.photo }}
              contentFit="cover"
              style={{ width: 80, height: 80, borderRadius: 6 }}
            />
            <View className="ml-5">
              <Text className="font-inter-bold text-base">{item.name}</Text>
              <Text className="font-inter-bold mt-[6.44px]">
                {(item.progressPercentage || 0).toFixed(2)}
                km
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
      >
        <BottomSheetView className="flex-1 z-50">
          <Text className="font-inter-bold text-base mx-5 mb-4 text-center mt-[26px]">
            Deseja descartar esta atividade?
          </Text>
          <Text className="text-center">
            Todo o progresso será perdido e não poderá ser recuperado.
          </Text>

          <TouchableOpacity
            className="mt-4"
            onPress={() => {
              bottomSheetRef.current?.close()
              router.dismissAll()
              router.replace('/dashboard')
            }}
          >
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400 mx-5">
              <Text className="text-bondis-alert-red text-base font-inter-bold ">
                Descartar atividade
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <View className="h-[51px] justify-center items-center">
              <Text className="text-base mx-auto font-inter-bold">Voltar</Text>
            </View>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}
