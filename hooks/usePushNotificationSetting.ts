import {
    PUSH_NOTIFICATION_ENABLED_KEY,
    PUSH_NOTIFICATION_TOKEN_KEY,
} from "@/constants/notification";
import { notificationService } from "@/lib/services/notification.service";
import { storage } from "@/stores/storage";
import {
    getNativePushTokenDetailed,
    hasPushPermission,
    isPushNotificationSupported,
    requestPushPermission,
    setupPushNotificationChannel,
} from "../utils/pushNotification";
import type { NativePushTokenFailureReason } from "../utils/pushNotification";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const ENABLED_VALUE = "1";
const DISABLED_VALUE = "0";

const getDeviceName = () => {
    const version = typeof Platform.Version === "number"
        ? `${Platform.Version}`
        : Platform.Version;

    return `mobile-${Platform.OS}-${version ?? "unknown"}`;
};

const getTokenFailureMessage = (reason?: NativePushTokenFailureReason) => {
    if (reason === "firebase-not-configured") {
        return "Không lấy được token thiết bị do app Android chưa có cấu hình Firebase (google-services.json).";
    }

    if (reason === "unsupported") {
        return "Thiết bị hoặc môi trường hiện tại chưa hỗ trợ thông báo đẩy cho app này.";
    }

    return "Không lấy được token thiết bị. Hãy kiểm tra mạng và thử lại sau vài giây.";
};

export const usePushNotificationSetting = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const persistEnabledState = useCallback(async (enabled: boolean, token = "") => {
        await storage.multiSet([
            [PUSH_NOTIFICATION_ENABLED_KEY, enabled ? ENABLED_VALUE : DISABLED_VALUE],
            [PUSH_NOTIFICATION_TOKEN_KEY, token],
        ]);
    }, []);

    const tryRegisterToken = useCallback(async () => {
        await setupPushNotificationChannel();

        const tokenResult = await getNativePushTokenDetailed();
        if (!tokenResult.token) {
            return tokenResult;
        }

        await notificationService.registerFcmToken({
            token: tokenResult.token,
            device: getDeviceName(),
        });

        await persistEnabledState(true, tokenResult.token);
        setIsEnabled(true);

        return tokenResult;
    }, [persistEnabledState]);

    const hydrate = useCallback(async () => {
        try {
            const granted = await hasPushPermission();
            if (!granted) {
                await persistEnabledState(false, "");
                setIsEnabled(false);
                return;
            }

            const saved = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
            const savedToken = await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY);
            const hasSavedEnabled = saved === ENABLED_VALUE;

            if (hasSavedEnabled && savedToken) {
                setIsEnabled(true);
                return;
            }

            if (!hasSavedEnabled) {
                setIsEnabled(false);
                return;
            }

            try {
                const tokenResult = await tryRegisterToken();
                if (!tokenResult.token) {
                    console.warn("Cannot sync push notification state", tokenResult.reason, tokenResult.errorMessage);
                    await persistEnabledState(false, "");
                    setIsEnabled(false);
                }
            } catch (error) {
                console.error("Cannot sync push notification state", error);
                await persistEnabledState(false, "");
                setIsEnabled(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [persistEnabledState, tryRegisterToken]);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    const enablePushNotifications = useCallback(async () => {
        if (!isPushNotificationSupported()) {
            Alert.alert(
                "Expo Go chưa hỗ trợ",
                "Thông báo đẩy Android không hoạt động trên Expo Go (SDK 53+). Vui lòng dùng development build để bật tính năng này.",
            );
            return false;
        }

        const granted = await requestPushPermission();

        if (!granted) {
            Alert.alert(
                "Chưa cấp quyền thông báo",
                "Vui lòng cấp quyền thông báo trong cài đặt thiết bị để bật thông báo đẩy.",
            );
            return false;
        }

        const tokenResult = await tryRegisterToken();
        if (!tokenResult.token) {
            console.warn("Cannot enable push notification", tokenResult.reason, tokenResult.errorMessage);
            Alert.alert(
                "Không thể bật thông báo đẩy",
                getTokenFailureMessage(tokenResult.reason),
            );
            return false;
        }

        return true;
    }, [tryRegisterToken]);

    const disablePushNotifications = useCallback(async () => {
        const token = await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY);

        if (token) {
            try {
                await notificationService.removeFcmToken(token);
            } catch (error) {
                console.error("Cannot remove FCM token", error);
            }
        }

        await persistEnabledState(false, "");
        setIsEnabled(false);

        return true;
    }, [persistEnabledState]);

    const setPushEnabled = useCallback(async (nextEnabled: boolean) => {
        if (isUpdating) {
            return false;
        }

        setIsUpdating(true);

        try {
            if (nextEnabled) {
                return await enablePushNotifications();
            }

            return await disablePushNotifications();
        } catch (error) {
            console.error("Update push notification setting failed", error);
            Alert.alert(
                "Không thể cập nhật",
                "Có lỗi xảy ra khi cập nhật cài đặt thông báo đẩy. Vui lòng thử lại.",
            );
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [disablePushNotifications, enablePushNotifications, isUpdating]);

    return {
        isEnabled,
        isLoading,
        isUpdating,
        setPushEnabled,
    };
};
