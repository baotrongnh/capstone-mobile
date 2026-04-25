import { PUSH_NOTIFICATION_ENABLED_KEY } from "@/constants/notification";
import { storage } from "@/stores/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
    getNativePushTokenDetailed,
    hasPushPermission,
    requestPushPermission,
    setupPushNotificationChannel,
} from "../utils/pushNotification";
import type { NativePushTokenFailureReason } from "../utils/pushNotification";
import {
    getStoredPushToken,
    persistPushState,
    registerPushToken,
    unregisterStoredPushToken,
} from "../utils/pushNotificationRegistration";

const PUSH_PERMISSION_DENIED_MESSAGE = "Vui lòng cấp quyền thông báo trong cài đặt thiết bị để bật thông báo đẩy.";

const getTokenFailureMessage = (reason?: NativePushTokenFailureReason) => {
    if (reason === "firebase-not-configured") {
        return "Không lấy được token thiết bị do app Android chưa có cấu hình Firebase (google-services.json).";
    }

    if (reason === "play-services-unavailable") {
        return "Google Play services chưa sẵn sàng trên thiết bị nên không thể nhận FCM token.";
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

    const persistCacheState = useCallback(async (enabled: boolean, token = "") => {
        try {
            await persistPushState(enabled, token);
            return true;
        } catch (error) {
            console.error("Cannot persist push notification setting", error);
            return false;
        }
    }, []);

    const syncPushToken = useCallback(async () => {
        await setupPushNotificationChannel();

        const tokenResult = await getNativePushTokenDetailed();
        if (!tokenResult.token) {
            return tokenResult;
        }

        const nextToken = tokenResult.token;
        await registerPushToken(nextToken);

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
            const savedPreference = await storage.getItem(PUSH_NOTIFICATION_ENABLED_KEY);
            const isExplicitlyDisabled = savedPreference === "0";

            if (!granted) {
                await persistCacheState(false, "");
                cachedTokenRef.current = null;

                if (mountedRef.current) {
                    setIsEnabled(false);
                    setErrorMessage(null);
                }
                return;
            }

            const savedToken = await getStoredPushToken();
            cachedTokenRef.current = savedToken;

            // If system permission is granted and the user never opted out in-app,
            // treat push as enabled and make sure we have a valid token.
            if (!isExplicitlyDisabled) {
                try {
                    const tokenResult = await syncPushToken();
                    if (!tokenResult.token && mountedRef.current) {
                        console.warn("Cannot sync push notification state", tokenResult.reason, tokenResult.errorMessage);
                        setIsEnabled(false);
                        setErrorMessage(getTokenFailureMessage(tokenResult.reason));
                    }
                } catch (error) {
                    console.error("Cannot sync push notification state", error);

                    if (mountedRef.current) {
                        setIsEnabled(false);
                        setErrorMessage("Không thể đồng bộ thông báo đẩy lúc này. Vui lòng thử lại sau.");
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
        const token = cachedTokenRef.current ?? await getStoredPushToken();

        try {
            await unregisterStoredPushToken(token ?? undefined);
        } catch (error) {
            console.error("Cannot remove FCM token", error);
            if (mountedRef.current) {
                setErrorMessage("Không thể tắt thông báo đẩy lúc này. Vui lòng thử lại khi có kết nối mạng ổn định.");
            }

            return false;
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
