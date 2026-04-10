import {
    UserDetail,
    UserIdentityField,
    UserProfileEditableValues,
} from "@/types/user";

export const USER_EMPTY_VALUE = "-";

export const toUserText = (value: unknown): string => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : USER_EMPTY_VALUE;
    }

    if (typeof value === "number") {
        return String(value);
    }

    return USER_EMPTY_VALUE;
};

export const hasUserValue = (value: unknown): boolean => {
    return toUserText(value) !== USER_EMPTY_VALUE;
};

export const formatUserDate = (value: unknown): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        return USER_EMPTY_VALUE;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN");
};

export const formatUserDateTime = (value: unknown): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        return USER_EMPTY_VALUE;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN");
};

export const getUserEditableValues = (
    user: UserDetail | null,
): UserProfileEditableValues => {
    return {
        fullName: toUserText(user?.fullName) === USER_EMPTY_VALUE ? "" : toUserText(user?.fullName),
        phone: toUserText(user?.phone) === USER_EMPTY_VALUE ? "" : toUserText(user?.phone),
        emergencyContactName:
            toUserText(user?.emergencyContactName) === USER_EMPTY_VALUE
                ? ""
                : toUserText(user?.emergencyContactName),
        emergencyContactPhone:
            toUserText(user?.emergencyContactPhone) === USER_EMPTY_VALUE
                ? ""
                : toUserText(user?.emergencyContactPhone),
    };
};

export const getUserIdentityFields = (
    user: UserDetail | null,
): UserIdentityField[] => {
    const identity = user?.identity;

    return [
        { key: "nationalId", label: "Số CCCD/CMND", value: identity?.nationalId },
        { key: "name", label: "Họ và tên trên giấy tờ", value: identity?.name },
        { key: "dob", label: "Ngày sinh trên giấy tờ", value: identity?.dob },
        { key: "sex", label: "Giới tính", value: identity?.sex },
        { key: "nationality", label: "Quốc tịch", value: identity?.nationality },
        { key: "ethnicity", label: "Dân tộc", value: identity?.ethnicity },
        { key: "home", label: "Quê quán", value: identity?.home },
        { key: "address", label: "Địa chỉ", value: identity?.address },
        { key: "issueDate", label: "Ngày cấp", value: identity?.issueDate },
        { key: "doe", label: "Ngày hết hạn", value: identity?.doe },
    ];
};
