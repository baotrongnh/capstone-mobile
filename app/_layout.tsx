import { PUSH_NOTIFICATION_ENABLED_KEY } from "@/constants/notification";
import AuthProvider from "@/components/providers/auth-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { useAuthStore } from "@/stores/auth.store";
import { storage } from "@/stores/storage";
import {
  getNativePushTokenDetailed,
  getNotificationsModule,
  hasPushPermission,
  registerPushNotificationListeners,
  setupPushNotificationChannel,
} from "@/utils/pushNotification";
import {
  getStoredPushToken,
  isPushEnabledLocally,
  persistPushState,
  registerPushToken,
} from "@/utils/pushNotificationRegistration";
import { getFireAlarmControlHref } from "@/utils/fireAlarmNotification";
import { isFireAlarmNotification, saveNotificationDebugPayload, type NotificationDebugPayload } from "@/utils/notificationDebug";
import { router, Stack, type Href } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  React.useEffect(() => {
    let mounted = true;
    let cleanupListeners: (() => void) | undefined;

    const persistGrantedPermissionState = async () => {
      const savedPreference = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);

      // Respect an explicit in-app opt-out. Otherwise, system permission means push should be on.
      if (savedPreference === "0") {
        return;
      }

      const tokenResult = await getNativePushTokenDetailed();
      if (!tokenResult.token) {
        console.warn("Cannot persist granted push permission state", tokenResult.reason, tokenResult.errorMessage);
        return;
      }

      await persistPushState(true, tokenResult.token);
    };

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

      const openNotification = async (
        source: "background" | "quit",
        message: { messageId?: string; data?: Record<string, string>; notification?: unknown },
      ) => {
        const payload: NotificationDebugPayload = {
          openedAt: new Date().toISOString(),
          source,
          messageId: message.messageId,
          data: message.data ?? {},
          notification: message.notification,
          routeHref: null,
          routeMatched: false,
        };

        const fireAlarmHref = getFireAlarmControlHref(payload.data);

        payload.routeHref = fireAlarmHref;
        payload.routeMatched = Boolean(fireAlarmHref);

        await saveNotificationDebugPayload(payload);
        router.push((isFireAlarmNotification(payload) && fireAlarmHref ? fireAlarmHref : "/notifications") as Href);
      };

      return registerPushNotificationListeners({
        onNotificationOpened: async (message) => {
          await openNotification("background", message);
        },
        onInitialNotification: async (message) => {
          await openNotification("quit", message);
        },
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
        await persistGrantedPermissionState();
        return;
      }

      const requestedPermission = await Notifications.requestPermissionsAsync();
      if (!mounted) {
        return;
      }

      if (requestedPermission.granted) {
        await persistGrantedPermissionState();
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
    void configurePushRuntime().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      mounted = false;
      cleanupListeners?.();
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const syncPushTokenForAuthenticatedUser = async () => {
      if (!isHydrated || !isAuthenticated) {
        return;
      }

      if (!(await hasPushPermission())) {
        return;
      }

      const savedPreference = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
      if (savedPreference === "0") {
        return;
      }

      let token = await getStoredPushToken();

      if (!token) {
        const tokenResult = await getNativePushTokenDetailed();
        token = tokenResult.token;

        if (!token) {
          console.warn("Cannot sync push token after authentication", tokenResult.reason, tokenResult.errorMessage);
          return;
        }
      }

      if (cancelled) {
        return;
      }

      try {
        await registerPushToken(token);
      } catch (error) {
        console.error("Cannot register FCM token for authenticated user", error);
      }
    };

    void syncPushTokenForAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrated]);

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
            <Stack.Screen name="fire-alarm-control" options={{ headerShown: false }} />
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
