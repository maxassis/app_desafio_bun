import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { View } from "react-native";

const TaskItemSkeleton = () => {
  return (
    <View className="px-5 mb-4">
      <ContentLoader
        speed={1}
        width={"100%"}
        height={100}
        backgroundColor="#e0e0e0"
        foregroundColor="#f5f5f5"
      >
        <Rect x="0" y="10" rx="8" ry="8" width="100%" height="80" />
      </ContentLoader>
    </View>
  );
};

export default TaskItemSkeleton;