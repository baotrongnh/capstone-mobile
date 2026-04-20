import { CONTRACT_MEMBER_STATUS_LABELS, CONTRACT_MEMBER_TYPE_LABELS } from "@/constants/myApartment"
import { toDisplayText } from "@/utils/userApartment"

const EMPTY_TEXT = "--"

const toReadableEnum = (value: unknown) => {
    if (typeof value !== "string" || value.trim().length === 0) {
        return EMPTY_TEXT
    }

    return value
        .trim()
        .toLowerCase()
        .split("_")
        .join(" ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatContractMemberType = (value: unknown) => {
    if (typeof value !== "string") {
        return EMPTY_TEXT
    }

    return CONTRACT_MEMBER_TYPE_LABELS[value.toLowerCase()] ?? toReadableEnum(value)
}

export const formatContractMemberStatus = (value: unknown) => {
    if (typeof value !== "string") {
        return EMPTY_TEXT
    }

    return CONTRACT_MEMBER_STATUS_LABELS[value.toLowerCase()] ?? toReadableEnum(value)
}

export const formatIotState = (value: unknown) => {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""

    if (normalized === "on") {
        return { label: "Bật", isOn: true }
    }

    if (normalized === "off") {
        return { label: "Tắt", isOn: false }
    }

    return { label: toDisplayText(value), isOn: false }
}