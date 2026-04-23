import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");
type FirebaseMessagingModule = typeof import("@react-native-firebase/messaging");

type NotificationsApi = {
    setNotificationHandler?: NotificationsModule["setNotificationHandler"];
    setNotificationChannelAsync?: NotificationsModule["setNotificationChannelAsync"];
    getPermissionsAsync?: NotificationsModule["getPermissionsAsync"];
    requestPermissionsAsync?: NotificationsModule["requestPermissionsAsync"];
    scheduleNotificationAsync?: NotificationsModule["scheduleNotificationAsync"];
    AndroidImportance?: NotificationsModule["AndroidImportance"];
};

type FirebaseRemoteMessage = {
    messageId?: string;
    notification?: {
        title?: string;
        body?: string;
    };
    data?: Record<string, string>;
};

type FirebaseMessagingApi = {
    getToken: () => Promise<string>;
    onTokenRefresh: (listener: (token: string) => void | Promise<void>) => () => void;
    onMessage: (listener: (message: FirebaseRemoteMessage) => void | Promise<void>) => () => void;
    onNotificationOpenedApp: (
        listener: (message: FirebaseRemoteMessage) => void | Promise<void>,
    ) => () => void;
    getInitialNotification: () => Promise<FirebaseRemoteMessage | null>;
};

export type NativePushTokenFailureReason =
    | "unsupported"
    | "firebase-not-configured"
    | "play-services-unavailable"
    | "native-error"
    | "token-empty";

export type NativePushTokenResult = {
    token: string | null;
    reason?: NativePushTokenFailureReason;
    errorMessage?: string;
};

type PushNotificationListenerOptions = {
    onForegroundMessage?: (message: FirebaseRemoteMessage) => void | Promise<void>;
    onNotificationOpened?: (message: FirebaseRemoteMessage) => void | Promise<void>;
    onInitialNotification?: (message: FirebaseRemoteMessage) => void | Promise<void>;
    onTokenRefresh?: (token: string) => void | Promise<void>;
};

const isExpoGoEnvironment = () => {
    const appOwnership = (Constants as { appOwnership?: string | null }).appOwnership;

    return (
        Constants.executionEnvironment === "storeClient"
        || appOwnership === "expo"
    );
};

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let firebaseMessagingModulePromise: Promise<FirebaseMessagingModule | null> | null = null;

export const isPushNotificationSupported = () => (
    Platform.OS === "android" && !isExpoGoEnvironment()
);

const toNotificationsApi = (module: NotificationsModule): NotificationsApi => {
    const candidate = module as NotificationsModule & { default?: NotificationsApi };

    if (candidate?.default && typeof candidate.default === "object") {
        return candidate.default;
    }

    return candidate;
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error ?? "Unknown error");
};

const normalizeToken = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const wait = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const isFirebaseConfigError = (message: string): boolean => {
    const normalized = message.toLowerCase();

    return (
        normalized.includes("firebaseapp")
        || normalized.includes("default firebaseapp")
        || normalized.includes("default app")
        || normalized.includes("google-services")
        || normalized.includes("firebase options")
    );
};

const isUnsupportedEnvironmentError = (message: string): boolean => {
    const normalized = message.toLowerCase();

    return (
        normalized.includes("expo go")
        || normalized.includes("development build")
        || normalized.includes("storeclient")
        || normalized.includes("store client")
        || normalized.includes("not supported")
    );
};

const isGooglePlayServicesError = (message: string): boolean => {
    const normalized = message.toLowerCase();

    return (
        normalized.includes("play services")
        || normalized.includes("service_not_available")
        || normalized.includes("missing google play")
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

export const getNotificationsModule = async (): Promise<NotificationsApi | null> => {
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

    const module = await notificationsModulePromise;
    if (!module) {
        return null;
    }

    return toNotificationsApi(module);
};

export const getFirebaseMessaging = async (): Promise<FirebaseMessagingApi | null> => {
    if (!isPushNotificationSupported()) {
        return null;
    }

    if (!firebaseMessagingModulePromise) {
        firebaseMessagingModulePromise = import("@react-native-firebase/messaging")
            .then((module) => module)
            .catch((error) => {
                console.error("Cannot load Firebase messaging module", error);
                return null;
            });
    }

    const module = await firebaseMessagingModulePromise;
    if (!module?.default) {
        return null;
    }

    return module.default() as FirebaseMessagingApi;
};

export const setupPushNotificationChannel = async () => {
    if (Platform.OS !== "android") {
        return;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications || !Notifications.setNotificationChannelAsync || !Notifications.AndroidImportance) {
        return;
    }

    await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
    });
};

export const hasPushPermission = async (): Promise<boolean> => {
    const Notifications = await getNotificationsModule();
    if (!Notifications || !Notifications.getPermissionsAsync) {
        return false;
    }

    const permission = await Notifications.getPermissionsAsync();
    return permission.granted;
};

export const requestPushPermission = async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications || !Notifications.getPermissionsAsync || !Notifications.requestPermissionsAsync) {
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
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
            return {
                token: null,
                reason: "unsupported",
                errorMessage: "Firebase messaging module is not available",
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
            const token = normalizeToken(await messaging.getToken());
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
            errorMessage: "Firebase messaging returned an empty FCM token",
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error);

        return {
            token: null,
            reason: isUnsupportedEnvironmentError(errorMessage)
                ? "unsupported"
                : isFirebaseConfigError(errorMessage)
                    ? "firebase-not-configured"
                    : isGooglePlayServicesError(errorMessage)
                        ? "play-services-unavailable"
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

const showForegroundNotification = async (message: FirebaseRemoteMessage) => {
    const title = message.notification?.title?.trim();
    const body = message.notification?.body?.trim();

    if (!title && !body) {
        return;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications?.scheduleNotificationAsync) {
        return;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title || "Notification",
            body,
            data: message.data ?? {},
            sound: "default",
        },
        trigger: null,
    });
};

export const registerPushNotificationListeners = async (
    options: PushNotificationListenerOptions = {},
) => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
        return () => undefined;
    }

    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(messaging.onMessage(async (message) => {
        if (__DEV__) {
            console.log("[push] Foreground message received", {
                messageId: message.messageId,
                data: message.data ?? {},
            });
        }

        await showForegroundNotification(message);
        await options.onForegroundMessage?.(message);
    }));

    unsubscribers.push(messaging.onNotificationOpenedApp(async (message) => {
        if (__DEV__) {
            console.log("[push] Notification opened from background", {
                messageId: message.messageId,
                data: message.data ?? {},
            });
        }

        await options.onNotificationOpened?.(message);
    }));

    unsubscribers.push(messaging.onTokenRefresh(async (token) => {
        if (__DEV__) {
            console.log("[push] Firebase token refreshed");
        }

        await options.onTokenRefresh?.(token);
    }));

    try {
        const initialNotification = await messaging.getInitialNotification();
        if (initialNotification) {
            if (__DEV__) {
                console.log("[push] App opened from quit state notification", {
                    messageId: initialNotification.messageId,
                    data: initialNotification.data ?? {},
                });
            }

            await options.onInitialNotification?.(initialNotification);
        }
    } catch (error) {
        console.error("Cannot read initial notification", error);
    }

    return () => {
        unsubscribers.forEach((unsubscribe) => {
            try {
                unsubscribe();
            } catch (error) {
                console.error("Cannot clean up push notification listener", error);
            }
        });
    };
};
