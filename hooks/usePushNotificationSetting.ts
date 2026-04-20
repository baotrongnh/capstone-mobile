import {
    PUSH_NOTIFICATION_ENABLED_KEY,
    PUSH_NOTIFICATION_TOKEN_KEY,
} from "@/constants/notification";
import { notificationService } from "@/lib/services/notification.service";
import { storage } from "@/stores/storage";
import {
    getNativePushToken,
    isPushNotificationSupported,
    requestPushPermission,
    setupPushNotificationChannel,
} from "@/utils/pushNotification";
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

export const usePushNotificationSetting = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const hydrate = useCallback(async () => {
        try {
            const saved = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
            setIsEnabled(saved === ENABLED_VALUE);
        } finally {
            setIsLoading(false);
        }
    }, []);

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

        await setupPushNotificationChannel();

        const token = await getNativePushToken();
        if (!token) {
            Alert.alert(
                "Không thể bật thông báo đẩy",
                "Không lấy được token thiết bị. Hãy thử lại trên thiết bị thật.",
            );
            return false;
        }

        await notificationService.registerFcmToken({
            token,
            device: getDeviceName(),
        });

        await storage.multiSet([
            [PUSH_NOTIFICATION_ENABLED_KEY, ENABLED_VALUE],
            [PUSH_NOTIFICATION_TOKEN_KEY, token],
        ]);
        setIsEnabled(true);

        return true;
    }, []);

    const disablePushNotifications = useCallback(async () => {
        const token = await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY);

        if (token) {
            try {
                await notificationService.removeFcmToken(token);
            } catch (error) {
                console.error("Cannot remove FCM token", error);
            }
        }

        await storage.multiSet([
            [PUSH_NOTIFICATION_ENABLED_KEY, DISABLED_VALUE],
            [PUSH_NOTIFICATION_TOKEN_KEY, ""],
        ]);
        setIsEnabled(false);

        return true;
    }, []);

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
