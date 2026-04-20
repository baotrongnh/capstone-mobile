export const PUSH_NOTIFICATION_ENABLED_KEY = "settings:push-notifications-enabled";
export const PUSH_NOTIFICATION_TOKEN_KEY = "settings:push-notification-token";

export type NotificationTypeIconName =
    | "information-outline"
    | "alert-outline"
    | "check-circle-outline"
    | "close-circle-outline"
    | "clock-outline"
    | "tag-outline"
    | "bell-outline";

export const NOTIFICATION_TYPE_ICON_MAP: Record<string, NotificationTypeIconName> = {
    info: "information-outline",
    warning: "alert-outline",
    success: "check-circle-outline",
    error: "close-circle-outline",
    reminder: "clock-outline",
    promotion: "tag-outline",
};

export const NOTIFICATION_TYPE_COLOR_MAP: Record<string, string> = {
    info: "#2563eb",
    warning: "#d97706",
    success: "#059669",
    error: "#dc2626",
    reminder: "#7c3aed",
    promotion: "#ea580c",
};
