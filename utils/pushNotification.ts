import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

const executionEnvironment = (Constants as { executionEnvironment?: string }).executionEnvironment;
const isExpoGo =
    executionEnvironment === "storeClient" ||
    Constants.appOwnership === "expo";

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

export const getNativePushToken = async (): Promise<string | null> => {
    try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
            return null;
        }

        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData?.data;

        if (typeof token === "string" && token.length > 0) {
            return token;
        }

        return null;
    } catch (error) {
        console.error("Cannot get native push token", error);
        return null;
    }
};
