import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

const TaskItemSkeleton = () => {
  return (
    <View className="px-5 mb-4">
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
          width: "100%",
          height: 100,
          borderRadius: 8,
          backgroundColor: "#e0e0e0",
        }}
      />
    </View>
  );
};

export  { TaskItemSkeleton }