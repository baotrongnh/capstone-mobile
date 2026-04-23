import {
    PUSH_NOTIFICATION_ENABLED_KEY,
    PUSH_NOTIFICATION_TOKEN_KEY,
} from "@/constants/notification";
import { notificationService } from "@/lib/services/notification.service";
import { storage } from "@/stores/storage";
import {
    getNativePushTokenDetailed,
    hasPushPermission,
    requestPushPermission,
    setupPushNotificationChannel,
} from "../utils/pushNotification";
import type { NativePushTokenFailureReason } from "../utils/pushNotification";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

const ENABLED_VALUE = "1";
const DISABLED_VALUE = "0";
const PUSH_PERMISSION_DENIED_MESSAGE = "Vui lòng cấp quyền thông báo trong cài đặt thiết bị để bật thông báo đẩy.";

const toStoredToken = (value: string | null) => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

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
        return "Môi trường hiện tại chưa hỗ trợ lấy token thông báo đẩy. Nếu đang dùng Expo Go, hãy mở app bằng development build.";
    }

    return "Không lấy được token thiết bị. Hãy kiểm tra mạng và thử lại sau vài giây.";
};

export const usePushNotificationSetting = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const mountedRef = useRef(true);
    const updateLockRef = useRef(false);
    const cachedTokenRef = useRef<string | null>(null);

    const persistEnabledState = useCallback(async (enabled: boolean, token = "") => {
        await storage.multiSet([
            [PUSH_NOTIFICATION_ENABLED_KEY, enabled ? ENABLED_VALUE : DISABLED_VALUE],
            [PUSH_NOTIFICATION_TOKEN_KEY, token],
        ]);
    }, []);

    const persistCacheState = useCallback(async (enabled: boolean, token = "") => {
        try {
            await persistEnabledState(enabled, token);
            return true;
        } catch (error) {
            console.error("Cannot persist push notification setting", error);
            return false;
        }
    }, [persistEnabledState]);

    const syncPushToken = useCallback(async () => {
        await setupPushNotificationChannel();

        const tokenResult = await getNativePushTokenDetailed();
        if (!tokenResult.token) {
            return tokenResult;
        }

        const nextToken = tokenResult.token;
        const previousToken = cachedTokenRef.current ?? toStoredToken(await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY));

        if (previousToken && previousToken !== nextToken) {
            try {
                await notificationService.removeFcmToken(previousToken);
            } catch (error) {
                console.error("Cannot remove previous FCM token before re-registering", error);
            }
        }

        await notificationService.registerFcmToken({
            token: nextToken,
            device: getDeviceName(),
        });

        cachedTokenRef.current = nextToken;
        if (!(await persistCacheState(true, nextToken)) && mountedRef.current) {
            setErrorMessage("Đã bật thông báo đẩy nhưng không thể lưu cài đặt cục bộ. Vui lòng mở lại màn hình để đồng bộ.");
        }

        if (mountedRef.current) {
            setIsEnabled(true);
        }

        return tokenResult;
    }, [persistCacheState]);

    const hydrate = useCallback(async () => {
        try {
            const granted = await hasPushPermission();
            if (!granted) {
                await persistCacheState(false, "");
                cachedTokenRef.current = null;

                if (mountedRef.current) {
                    setIsEnabled(false);
                    setErrorMessage(null);
                }
                return;
            }

            const saved = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
            const savedToken = toStoredToken(await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY));
            const hasSavedEnabled = saved === ENABLED_VALUE;

            cachedTokenRef.current = savedToken;

            if (hasSavedEnabled) {
                try {
                    const tokenResult = await syncPushToken();
                    if (!tokenResult.token) {
                        console.warn("Cannot sync push notification state", tokenResult.reason, tokenResult.errorMessage);
                        await persistCacheState(false, "");
                        cachedTokenRef.current = null;

                        if (mountedRef.current) {
                            setIsEnabled(false);
                            setErrorMessage(null);
                        }
                    }
                } catch (error) {
                    console.error("Cannot sync push notification state", error);
                    await persistCacheState(false, "");
                    cachedTokenRef.current = null;

                    if (mountedRef.current) {
                        setIsEnabled(false);
                        setErrorMessage(null);
                    }
                }

                return;
            }

            await persistCacheState(false, "");

            if (mountedRef.current) {
                setIsEnabled(false);
                setErrorMessage(null);
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [persistCacheState, syncPushToken]);

    useEffect(() => {
        mountedRef.current = true;
        void hydrate();

        return () => {
            mountedRef.current = false;
        };
    }, [hydrate]);

    const enablePushNotifications = useCallback(async () => {
        const granted = await requestPushPermission();

        if (!granted) {
            if (mountedRef.current) {
                setErrorMessage(PUSH_PERMISSION_DENIED_MESSAGE);
            }

            Alert.alert(
                "Chưa cấp quyền thông báo",
                PUSH_PERMISSION_DENIED_MESSAGE,
            );
            return false;
        }

        const tokenResult = await syncPushToken();
        if (!tokenResult.token) {
            console.warn("Cannot enable push notification", tokenResult.reason, tokenResult.errorMessage);
            if (mountedRef.current) {
                setErrorMessage(getTokenFailureMessage(tokenResult.reason));
            }

            Alert.alert(
                "Không thể bật thông báo đẩy",
                getTokenFailureMessage(tokenResult.reason),
            );
            return false;
        }

        if (mountedRef.current) {
            setErrorMessage(null);
        }

        return true;
    }, [syncPushToken]);

    const disablePushNotifications = useCallback(async () => {
        const token = cachedTokenRef.current ?? toStoredToken(await storage.getItem(PUSH_NOTIFICATION_TOKEN_KEY));

        if (token) {
            try {
                await notificationService.removeFcmToken(token);
            } catch (error) {
                console.error("Cannot remove FCM token", error);
                if (mountedRef.current) {
                    setErrorMessage("Không thể tắt thông báo đẩy lúc này. Vui lòng thử lại khi có kết nối mạng ổn định.");
                }

                return false;
            }
        }

        cachedTokenRef.current = null;

        const cachedStateSaved = await persistCacheState(false, "");
        if (mountedRef.current) {
            setIsEnabled(false);
            if (!cachedStateSaved) {
                setErrorMessage("Đã tắt thông báo đẩy nhưng không thể lưu trạng thái cục bộ.");
            } else {
                setErrorMessage(null);
            }
        }

        return true;
    }, [persistCacheState]);

    const setPushEnabled = useCallback(async (nextEnabled: boolean) => {
        if (updateLockRef.current || isLoading) {
            return false;
        }

        updateLockRef.current = true;
        setIsUpdating(true);
        setErrorMessage(null);

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
            updateLockRef.current = false;
            if (mountedRef.current) {
                setIsUpdating(false);
            }
        }
    }, [disablePushNotifications, enablePushNotifications, isLoading]);

    return {
        isEnabled,
        isLoading,
        isUpdating,
        errorMessage,
        setPushEnabled,
    };
};
