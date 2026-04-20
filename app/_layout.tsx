import AuthProvider from "@/components/providers/auth-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import {
  getNotificationsModule,
  isPushNotificationSupported,
} from "@/utils/pushNotification";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  React.useEffect(() => {
    let mounted = true;

    const configureNotificationHandler = async () => {
      if (!isPushNotificationSupported()) {
        return;
      }

      const Notifications = await getNotificationsModule();

      if (!mounted || !Notifications) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    void configureNotificationHandler();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Stack.Screen name="payment/success" options={{ headerShown: false }} />
            <Stack.Screen name="payment/fail" options={{ headerShown: false }} />
            <Stack.Screen name="my-apartments" options={{ headerShown: false }} />
            <Stack.Screen name="my-apartment-detail" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}
