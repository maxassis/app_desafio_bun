import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="configInit" />
      <Stack.Screen name="configEdit" />
    </Stack>
  );
}
