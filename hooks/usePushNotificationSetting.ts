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

const PUSH_PERMISSION_DENIED_MESSAGE = "Vui long cap quyen thong bao trong cai dat thiet bi de bat thong bao day.";
const BACKEND_SYNC_FAILED_MESSAGE = "Thong bao day da duoc bat tren thiet bi, nhung app chua dong bo token len may chu. Ban se chua nhan duoc push tu he thong cho den khi dong bo thanh cong.";

const getTokenFailureMessage = (reason?: NativePushTokenFailureReason) => {
    if (reason === "firebase-not-configured") {
        return "Khong lay duoc token thiet bi do app Android chua co cau hinh Firebase (google-services.json).";
    }

    if (reason === "play-services-unavailable") {
        return "Google Play services chua san sang tren thiet bi nen khong the nhan FCM token.";
    }

    if (reason === "unsupported") {
        return "Moi truong hien tai chua ho tro lay token thong bao day. Neu dang dung Expo Go, hay mo app bang development build.";
    }

    return "Khong lay duoc token thiet bi. Hay kiem tra mang va thu lai sau vai giay.";
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

        try {
            await registerPushToken(nextToken);
        } catch (error) {
            console.error("Cannot register push token with backend", error);

            cachedTokenRef.current = nextToken;
            await persistCacheState(true, nextToken);

            if (mountedRef.current) {
                setIsEnabled(true);
                setErrorMessage(BACKEND_SYNC_FAILED_MESSAGE);
            }

            return tokenResult;
        }

        cachedTokenRef.current = nextToken;
        if (!(await persistCacheState(true, nextToken)) && mountedRef.current) {
            setErrorMessage("Da bat thong bao day nhung khong the luu cai dat cuc bo. Vui long mo lai man hinh de dong bo.");
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

            if (!isExplicitlyDisabled) {
                const tokenResult = await syncPushToken();

                if (!tokenResult.token && mountedRef.current) {
                    console.warn("Cannot sync push notification state", tokenResult.reason, tokenResult.errorMessage);
                    setIsEnabled(false);
                    setErrorMessage(getTokenFailureMessage(tokenResult.reason));
                }

                return;
            }

            await persistCacheState(false, "");

            if (mountedRef.current) {
                setIsEnabled(false);
                setErrorMessage(null);
            }
        } catch (error) {
            console.error("Cannot hydrate push notification state", error);

            if (mountedRef.current) {
                setIsEnabled(false);
                setErrorMessage("Khong the dong bo thong bao day luc nay. Vui long thu lai sau.");
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
                "Chua cap quyen thong bao",
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
                "Khong the bat thong bao day",
                getTokenFailureMessage(tokenResult.reason),
            );
            return false;
        }

        if (mountedRef.current && errorMessage !== BACKEND_SYNC_FAILED_MESSAGE) {
            setErrorMessage(null);
        }

        return true;
    }, [errorMessage, syncPushToken]);

    const disablePushNotifications = useCallback(async () => {
        const token = cachedTokenRef.current ?? await getStoredPushToken();

        try {
            await unregisterStoredPushToken(token ?? undefined);
        } catch (error) {
            console.error("Cannot remove FCM token", error);
            if (mountedRef.current) {
                setErrorMessage("Khong the tat thong bao day luc nay. Vui long thu lai khi co ket noi mang on dinh.");
            }

            return false;
        }

        cachedTokenRef.current = null;

        const cachedStateSaved = await persistCacheState(false, "");
        if (mountedRef.current) {
            setIsEnabled(false);
            if (!cachedStateSaved) {
                setErrorMessage("Da tat thong bao day nhung khong the luu trang thai cuc bo.");
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
                "Khong the cap nhat",
                "Co loi xay ra khi cap nhat cai dat thong bao day. Vui long thu lai.",
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
