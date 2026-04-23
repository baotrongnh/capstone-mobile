import { Platform } from "react-native";

if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messaging = require("@react-native-firebase/messaging").default;

    messaging().setBackgroundMessageHandler(async (remoteMessage: { messageId?: string }) => {
      console.log("[push] Background message received", remoteMessage?.messageId ?? "unknown");
    });
  } catch (error) {
    console.error("[push] Cannot register background message handler", error);
  }
}

// eslint-disable-next-line import/first
import "expo-router/entry";
