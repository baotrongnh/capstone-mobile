import { NativeModules, Platform } from "react-native";

const hasReactNativeFirebaseAppModule = () => {
  const nativeModules = NativeModules as Record<string, unknown>;

  return Boolean(
    nativeModules.RNFBAppModule
    || nativeModules.ReactNativeFirebaseAppModule
    || nativeModules.RNFBMessagingModule,
  );
};

if (Platform.OS !== "web" && hasReactNativeFirebaseAppModule()) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messaging = require("@react-native-firebase/messaging").default;

    messaging().setBackgroundMessageHandler(async (remoteMessage: { messageId?: string }) => {
      console.log("[push] Background message received", remoteMessage?.messageId ?? "unknown");
    });
  } catch (error) {
    console.error("[push] Cannot register background message handler", error);
  }
} else if (Platform.OS !== "web" && __DEV__) {
  console.warn("[push] Firebase native module is unavailable in the current app binary.");
}

// eslint-disable-next-line import/first
import "expo-router/entry";
