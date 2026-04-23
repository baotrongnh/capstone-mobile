import Constants from "expo-constants";
import { Platform } from "react-native";
import {
    PUSH_NOTIFICATION_ENABLED_KEY,
    PUSH_NOTIFICATION_TOKEN_KEY,
} from "@/constants/notification";
import { notificationService } from "@/lib/services/notification.service";
import { storage } from "@/stores/storage";

const ENABLED_VALUE = "1";

const normalizeValue = (value: string | null | undefined) => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const getAndroidIdentity = () => {
    const constants = Platform.constants as {
        Brand?: string;
        Manufacturer?: string;
        Model?: string;
    };

    const brand = normalizeValue(constants?.Brand);
    const manufacturer = normalizeValue(constants?.Manufacturer);
    const model = normalizeValue(constants?.Model);

    return {
        brand,
        manufacturer,
        model,
    };
};

export const getPushDeviceName = () => {
    const version = typeof Platform.Version === "number"
        ? `${Platform.Version}`
        : normalizeValue(`${Platform.Version ?? ""}`);

    if (Platform.OS === "android") {
        const identity = getAndroidIdentity();
        const deviceName = normalizeValue(
            (Constants as { deviceName?: string | null }).deviceName ?? undefined,
        );

        if (deviceName && identity.model && deviceName !== identity.model) {
            return `${deviceName} (${identity.model})`;
        }

        if (deviceName) {
            return deviceName;
        }

        if (identity.manufacturer && identity.model) {
            return `${identity.manufacturer} ${identity.model}`;
        }

        if (identity.brand && identity.model) {
            return `${identity.brand} ${identity.model}`;
        }

        if (identity.model) {
            return identity.model;
        }
    }

    return `mobile-${Platform.OS}-${version ?? "unknown"}`;
};

const hasAccessToken = async () => {
    const accessToken = normalizeValue(await storage.getItem("accessToken"));
    return Boolean(accessToken);
};

export const getStoredPushToken = async () => {
    return normalizeValue(await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY));
};

export const isPushEnabledLocally = async () => {
    const enabled = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
    return enabled === ENABLED_VALUE;
};

export const persistPushState = async (enabled: boolean, token = "") => {
    await storage.multiSet([
        [PUSH_NOTIFICATION_ENABLED_KEY, enabled ? ENABLED_VALUE : "0"],
        [PUSH_NOTIFICATION_TOKEN_KEY, token],
    ]);
};

export const unregisterStoredPushToken = async (tokenOverride?: string) => {
    const token = normalizeValue(tokenOverride) ?? await getStoredPushToken();

    if (token && await hasAccessToken()) {
        await notificationService.removeFcmToken(token);
    }

    await persistPushState(false, "");
    return token;
};

export const registerPushToken = async (nextToken: string) => {
    const normalizedToken = normalizeValue(nextToken);
    if (!normalizedToken) {
        throw new Error("FCM token is empty");
    }

    const previousToken = await getStoredPushToken();
    const authenticated = await hasAccessToken();

    if (authenticated) {
        if (previousToken && previousToken !== normalizedToken) {
            try {
                await notificationService.removeFcmToken(previousToken);
            } catch (error) {
                console.error("Cannot remove previous FCM token before re-registering", error);
            }
        }

        await notificationService.registerFcmToken({
            token: normalizedToken,
            device: getPushDeviceName(),
        });
    }

    await persistPushState(true, normalizedToken);

    if (__DEV__) {
        console.log("[push] Registered FCM token", {
            authenticated,
            device: getPushDeviceName(),
            tokenPreview: `${normalizedToken.slice(0, 12)}...`,
        });
    }

    return {
        token: normalizedToken,
        registeredToBackend: authenticated,
    };
};
