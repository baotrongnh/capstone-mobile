import { MenuItemData } from "@/types/user";

export const PROFILE_MENU_ITEMS: MenuItemData[] = [
    {
        id: "profile-details",
        label: "Thông tin tài khoản",
        icon: "person",
        screen: "profile-details",
    },
    {
        id: "settings",
        label: "Cài đặt",
        icon: "settings",
        screen: "settings",
    },
    {
        id: "debug",
        label: "Debug thiết bị",
        icon: "bug-outline",
        screen: "debug",
    },
    {
        id: "support",
        label: "Hỗ trợ",
        icon: "help-circle",
        screen: "support",
    },
    {
        id: "logout",
        label: "Đăng xuất",
        icon: "log-out",
        screen: "logout",
    },
];
