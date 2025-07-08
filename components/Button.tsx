import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, isLoading = false, disabled = false }: ButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center ${
        isDisabled ? 'opacity-50' : ''
      }`}
      disabled={isDisabled}
    >
      <View className="flex-row items-center">
        <Text className="font-inter-bold text-base text-black">
          {isLoading ? 'Carregando...' : title}
        </Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#000000"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}