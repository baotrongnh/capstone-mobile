import ReactQueryProvider from '@/components/providers/react-query-provider'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <Stack>
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ReactQueryProvider>
  )
}
