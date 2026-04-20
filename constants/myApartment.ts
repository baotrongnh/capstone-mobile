import type { IotDeviceTopic } from "@/types/userApartment"

export const CONTRACT_MEMBER_TYPE_LABELS: Record<string, string> = {
    primary: "Thành viên chính",
    co_tenant: "Thành viên phụ",
    tenant: "Thành viên thuê",
}

export const CONTRACT_MEMBER_STATUS_LABELS: Record<string, string> = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    pending: "Đang chờ",
    removed: "Đã rời hợp đồng",
}

export const IOT_TOPIC_ICON_MAP: Record<IotDeviceTopic, string> = {
    door: "door",
    light: "lightbulb-outline",
    curtain: "curtains",
    alarm: "shield-home-outline",
    unknown: "chip",
}