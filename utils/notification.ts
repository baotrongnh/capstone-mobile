import {
    NOTIFICATION_TYPE_COLOR_MAP,
    NOTIFICATION_TYPE_ICON_MAP,
    NotificationTypeIconName,
} from "@/constants/notification";

export const formatNotificationTime = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return "Vừa xong";
    }

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
};

export const getNotificationTypeIcon = (type: string): NotificationTypeIconName => {
    return NOTIFICATION_TYPE_ICON_MAP[type] ?? "bell-outline";
};

export const getNotificationTypeColor = (type: string) => {
    return NOTIFICATION_TYPE_COLOR_MAP[type] ?? "#3b82f6";
};
