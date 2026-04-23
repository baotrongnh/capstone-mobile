import { PUSH_NOTIFICATION_ENABLED_KEY } from "@/constants/notification";
import { storage } from "@/stores/storage";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const ENABLED_VALUE = "1";
const PUSH_PERMISSION_DENIED_MESSAGE = "Vui lÃ²ng cáº¥p quyá»n thÃ'ng bÃ¡o trong cÃ i Ä‘áº·t thiáº¿t bá»‹ Ä‘á»ƒ báº­t thÃ'ng bÃ¡o Ä‘áº©y.";

const getTokenFailureMessage = (reason?: NativePushTokenFailureReason) => {
    if (reason === "firebase-not-configured") {
        return "KhÃ'ng láº¥y Ä‘Æ°á»£c token thiáº¿t bá»‹ do app Android chÆ°a cÃ³ cáº¥u hÃ¬nh Firebase (google-services.json).";
    }

    if (reason === "play-services-unavailable") {
        return "Google Play services chÆ°a sáºµn sÃ ng trÃªn thiáº¿t bá»‹ nÃªn khÃ'ng thá»ƒ nháº­n FCM token.";
    }

    if (reason === "unsupported") {
        return "MÃ'i trÆ°á»ng hiá»‡n táº¡i chÆ°a há»— trá»£ láº¥y token thÃ'ng bÃ¡o Ä‘áº©y. Náº¿u Ä‘ang dÃ¹ng Expo Go, hÃ£y má»Ÿ app báº±ng development build.";
    }

    return "KhÃ'ng láº¥y Ä‘Æ°á»£c token thiáº¿t bá»‹. HÃ£y kiá»ƒm tra máº¡ng vÃ  thá»­ láº¡i sau vÃ i giÃ¢y.";
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
            setErrorMessage("ÄÃ£ báº­t thÃ'ng bÃ¡o Ä‘áº©y nhÆ°ng khÃ'ng thá»ƒ lÆ°u cÃ i Ä‘áº·t cá»¥c bá»™. Vui lÃ²ng má»Ÿ láº¡i mÃ n hÃ¬nh Ä‘á»ƒ Ä‘á»“ng bá»™.");
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
            const savedToken = await getStoredPushToken();
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
                "ChÆ°a cáº¥p quyá»n thÃ'ng bÃ¡o",
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
                "KhÃ'ng thá»ƒ báº­t thÃ'ng bÃ¡o Ä‘áº©y",
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
                setErrorMessage("KhÃ'ng thá»ƒ táº¯t thÃ'ng bÃ¡o Ä‘áº©y lÃºc nÃ y. Vui lÃ²ng thá»­ láº¡i khi cÃ³ káº¿t ná»‘i máº¡ng á»•n Ä‘á»‹nh.");
            }

            return false;
        }

        cachedTokenRef.current = null;

        const cachedStateSaved = await persistCacheState(false, "");
        if (mountedRef.current) {
            setIsEnabled(false);
            if (!cachedStateSaved) {
                setErrorMessage("ÄÃ£ táº¯t thÃ'ng bÃ¡o Ä‘áº©y nhÆ°ng khÃ'ng thá»ƒ lÆ°u tráº¡ng thÃ¡i cá»¥c bá»™.");
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
                "KhÃ'ng thá»ƒ cáº­p nháº­t",
                "CÃ³ lá»—i xáº£y ra khi cáº­p nháº­t cÃ i Ä‘áº·t thÃ'ng bÃ¡o Ä‘áº©y. Vui lÃ²ng thá»­ láº¡i.",
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
