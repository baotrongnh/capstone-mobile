import AuthProvider from "@/components/providers/auth-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="wifi-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="more-services" options={{ headerShown: false }} />
          <Stack.Screen name='invoices' options={{ headerShown: false }} />
          <Stack.Screen name="invoices/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="my-apartments" options={{ headerShown: false }} />
          <Stack.Screen name="my-apartment-detail" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
