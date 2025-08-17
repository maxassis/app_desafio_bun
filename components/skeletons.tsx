import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

// Configurações comuns para os skeletons
const skeletonColors = {
  backgroundColor: "#e0e0e0",
  foregroundColor: "#f0f0f0",
};

// Skeleton para o avatar do usuário
export const AvatarSkeleton = () => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{
      type: "timing",
      duration: 800,
      loop: true,
      repeatReverse: true,
    }}
    style={{
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: skeletonColors.backgroundColor,
    }}
  />
);

// Skeleton para as informações do usuário
export const UserInfoSkeleton = () => (
  <View className="mt-[29px] items-center">
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width: 120,
        height: 24,
        borderRadius: 4,
        backgroundColor: skeletonColors.backgroundColor,
        marginBottom: 11,
      }}
    />
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width: 160,
        height: 16,
        borderRadius: 3,
        backgroundColor: skeletonColors.backgroundColor,
        marginBottom: 20,
      }}
    />
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width: 80,
        height: 16,
        borderRadius: 3,
        backgroundColor: skeletonColors.backgroundColor,
      }}
    />
  </View>
);

// Skeleton para as estatísticas do usuário
export const StatsSkeleton = () => (
  <View className="flex-row justify-between h-[51px] mt-[10px] mx-4">
    <View className="items-center">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 3,
          backgroundColor: skeletonColors.backgroundColor,
          marginBottom: 8,
        }}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 60,
          height: 12,
          borderRadius: 2,
          backgroundColor: skeletonColors.backgroundColor,
          marginBottom: 3,
        }}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 40,
          height: 8,
          borderRadius: 2,
          backgroundColor: skeletonColors.backgroundColor,
        }}
      />
    </View>
    <View className="items-center">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 3,
          backgroundColor: skeletonColors.backgroundColor,
          marginBottom: 8,
        }}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 60,
          height: 12,
          borderRadius: 2,
          backgroundColor: skeletonColors.backgroundColor,
          marginBottom: 3,
        }}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 50,
          height: 8,
          borderRadius: 2,
          backgroundColor: skeletonColors.backgroundColor,
        }}
      />
    </View>
    <View className="items-center">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 40,
          height: 20,
          borderRadius: 3,
          backgroundColor: skeletonColors.backgroundColor,
          marginBottom: 8,
        }}
      />
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
        style={{
          width: 40,
          height: 12,
          borderRadius: 2,
          backgroundColor: skeletonColors.backgroundColor,
        }}
      />
    </View>
  </View>
);

// Skeleton para os cards de desafio
export const CardDesafioSkeleton = ({ width = 216 }: { width?: number }) => (
  <View className={`w-[${width}px] px-2`}>
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width: width - 16,
        height: 182,
        borderRadius: 12,
        backgroundColor: skeletonColors.backgroundColor,
        padding: 12,
      }}
    >
      {/* Área da imagem */}
      <View
        style={{
          width: width - 40,
          height: 100,
          borderRadius: 8,
          backgroundColor: skeletonColors.foregroundColor,
          marginBottom: 13,
        }}
      />
      
      {/* Título */}
      <View
        style={{
          width: width - 60,
          height: 16,
          borderRadius: 4,
          backgroundColor: skeletonColors.foregroundColor,
          marginBottom: 23,
        }}
      />
      
      {/* Distância */}
      <View
        style={{
          width: 60,
          height: 12,
          borderRadius: 3,
          backgroundColor: skeletonColors.foregroundColor,
          marginBottom: 19,
        }}
      />
      
      {/* Barra de progresso */}
      <View
        style={{
          width: width - 40,
          height: 6,
          borderRadius: 2,
          backgroundColor: skeletonColors.foregroundColor,
        }}
      />
    </MotiView>
  </View>
);

// Skeleton para o título das seções
export const SectionTitleSkeleton = ({ width = 180 }: { width?: number }) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{
      type: "timing",
      duration: 800,
      loop: true,
      repeatReverse: true,
    }}
    style={{
      width: width,
      height: 24,
      borderRadius: 4,
      backgroundColor: skeletonColors.backgroundColor,
      marginLeft: 20,
      marginBottom: 16,
    }}
  />
);