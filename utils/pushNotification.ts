import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

export type NativePushTokenFailureReason =
    | "unsupported"
    | "firebase-not-configured"
    | "native-error"
    | "token-empty";

export type NativePushTokenResult = {
    token: string | null;
    reason?: NativePushTokenFailureReason;
    errorMessage?: string;
};

const isExpoGo = Constants.executionEnvironment === "storeClient";

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

export const isPushNotificationSupported = () => !isExpoGo;

export const getNotificationsModule = async (): Promise<NotificationsModule | null> => {
    if (!isPushNotificationSupported()) {
        return null;
    }

    if (!notificationsModulePromise) {
        notificationsModulePromise = import("expo-notifications")
            .then((module) => module)
            .catch((error) => {
                console.error("Cannot load expo-notifications module", error);
                return null;
            });
    }

    return notificationsModulePromise;
};

export const setupPushNotificationChannel = async () => {
    if (Platform.OS !== "android") {
        return;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return;
    }

    await Notifications.setNotificationChannelAsync("default", {
        name: "Mặc định",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
    });
};

const wait = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const normalizeTokenData = (value: unknown): string | null => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    return null;
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error ?? "Unknown error");
};

const isFirebaseConfigError = (message: string): boolean => {
    const normalized = message.toLowerCase();

    return (
        normalized.includes("firebaseapp") ||
        normalized.includes("default firebaseapp") ||
        normalized.includes("default app") ||
        normalized.includes("google-services") ||
        normalized.includes("fcm")
    );
};

const getAndroidFirebaseConfigState = (): "configured" | "missing" | "unknown" => {
    if (Platform.OS !== "android") {
        return "configured";
    }

    const googleServicesFile =
        (Constants.expoConfig as { android?: { googleServicesFile?: string } } | null)?.android
            ?.googleServicesFile;

    if (typeof googleServicesFile !== "string") {
        return "unknown";
    }

    return googleServicesFile.trim().length > 0 ? "configured" : "missing";
};

export const hasPushPermission = async (): Promise<boolean> => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return false;
    }

    const permission = await Notifications.getPermissionsAsync();
    return permission.granted;
};

export const requestPushPermission = async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
        return false;
    }

    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
        return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
};

export const getNativePushTokenDetailed = async (
    retries = 2,
    retryDelayMs = 600,
): Promise<NativePushTokenResult> => {
    try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
            return {
                token: null,
                reason: "unsupported",
                errorMessage: "expo-notifications module is not available",
            };
        }

        if (getAndroidFirebaseConfigState() === "missing") {
            return {
                token: null,
                reason: "firebase-not-configured",
                errorMessage: "android.googleServicesFile is missing in app config",
            };
        }

        for (let attempt = 0; attempt <= retries; attempt += 1) {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            const token = normalizeTokenData(tokenData?.data);

            if (token) {
                return { token };
            }

            if (attempt < retries) {
                await wait(retryDelayMs);
            }
        }

        return {
            token: null,
            reason: "token-empty",
            errorMessage: "Native push token was empty",
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error);

        return {
            token: null,
            reason: isFirebaseConfigError(errorMessage)
                ? "firebase-not-configured"
                : "native-error",
            errorMessage,
        };
    }
};

export const getNativePushToken = async (
    retries = 2,
    retryDelayMs = 600,
): Promise<string | null> => {
    const result = await getNativePushTokenDetailed(retries, retryDelayMs);

    if (!result.token && result.errorMessage) {
        console.error("Cannot get native push token", result.errorMessage);
    }

    return result.token;
};
