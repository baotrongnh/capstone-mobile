import AuthProvider from "@/components/providers/auth-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import {
  getNotificationsModule,
} from "@/utils/pushNotification";
import { Stack } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  React.useEffect(() => {
    let mounted = true;

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
        "Chưa cấp quyền thông báo",
        "Bạn đã từ chối thông báo. Bạn có thể bật lại quyền này trong Cài đặt thiết bị.",
        [
          {
            text: "Để sau",
            style: "cancel",
          },
          {
            text: "Mở Cài đặt",
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
    };

    void configureNotificationHandler();
    void requestNotificationPermissionOnLaunch();

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
