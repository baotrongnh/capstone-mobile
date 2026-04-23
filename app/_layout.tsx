import AuthProvider from "@/components/providers/auth-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import {
  getNotificationsModule,
  registerPushNotificationListeners,
  setupPushNotificationChannel,
} from "@/utils/pushNotification";
import {
  isPushEnabledLocally,
  registerPushToken,
} from "@/utils/pushNotificationRegistration";
import { Stack } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  React.useEffect(() => {
    let mounted = true;
    let cleanupListeners: (() => void) | undefined;

    const configureNotificationHandler = async () => {
      const Notifications = await getNotificationsModule();

      if (!mounted || !Notifications || !Notifications.setNotificationHandler) {
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

    const configurePushRuntime = async () => {
      await setupPushNotificationChannel();

      return registerPushNotificationListeners({
        onTokenRefresh: async (token) => {
          if (!(await isPushEnabledLocally())) {
            return;
          }

          try {
            await registerPushToken(token);
          } catch (error) {
            console.error("Cannot sync refreshed FCM token", error);
          }
        },
      });
    };

    const requestNotificationPermissionOnLaunch = async () => {
      const Notifications = await getNotificationsModule();

      if (
        !mounted
        || !Notifications
        || !Notifications.getPermissionsAsync
        || !Notifications.requestPermissionsAsync
      ) {
        return;
      }

      const currentPermission = await Notifications.getPermissionsAsync();
      if (currentPermission.granted) {
        return;
      }

      const requestedPermission = await Notifications.requestPermissionsAsync();

      if (!mounted || requestedPermission.granted) {
        return;
      }

      Alert.alert(
        "ChÆ°a cáº¥p quyá»n thÃ'ng bÃ¡o",
        "Báº¡n Ä‘Ã£ tá»« chá»‘i thÃ'ng bÃ¡o. Báº¡n cÃ³ thá»ƒ báº­t láº¡i quyá»n nÃ y trong CÃ i Ä‘áº·t thiáº¿t bá»‹.",
        [
          {
            text: "Äá»ƒ sau",
            style: "cancel",
          },
          {
            text: "Má»Ÿ CÃ i Ä‘áº·t",
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
    };

    void configureNotificationHandler();
    void requestNotificationPermissionOnLaunch();
    void configurePushRuntime().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      mounted = false;
      cleanupListeners?.();
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
            <Stack.Screen name="door-history" options={{ headerShown: false }} />
            <Stack.Screen name="debug" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="more-services" options={{ headerShown: false }} />
            <Stack.Screen name="invoices" options={{ headerShown: false }} />
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
