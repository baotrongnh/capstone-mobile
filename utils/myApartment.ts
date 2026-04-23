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

const CONTRACT_STATUS_LABELS: Record<string, string> = {
    draft: "Nháp",
    pending: "Chờ duyệt",
    signed: "Đã ký",
    active: "Đang hiệu lực",
    expired: "Hết hạn",
    terminated: "Đã chấm dứt",
    cancelled: "Đã hủy",
}

const CONTRACT_CATEGORY_LABELS: Record<string, string> = {
    normal: "Thông thường",
    renewal: "Gia hạn",
    extension: "Gia hạn",
    lease: "Cho thuê",
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    bank_transfer: "Chuyển khoản",
    bankTransfer: "Chuyển khoản",
    cash: "Tiền mặt",
    e_wallet: "Ví điện tử",
    eWallet: "Ví điện tử",
    auto_debit: "Tự động trích nợ",
    autoDebit: "Tự động trích nợ",
    credit_card: "Thẻ tín dụng",
    creditCard: "Thẻ tín dụng",
    debit_card: "Thẻ ghi nợ",
    debitCard: "Thẻ ghi nợ",
    other: "Khác",
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

export const formatContractStatus = (value: unknown) => {
    if (typeof value !== "string") {
        return EMPTY_TEXT
    }

    return CONTRACT_STATUS_LABELS[value.toLowerCase()] ?? toReadableEnum(value)
}

export const formatContractCategory = (value: unknown) => {
    if (typeof value !== "string") {
        return EMPTY_TEXT
    }

    return CONTRACT_CATEGORY_LABELS[value.toLowerCase()] ?? toReadableEnum(value)
}

export const formatPaymentMethod = (value: unknown) => {
    if (typeof value !== "string") {
        return EMPTY_TEXT
    }

    return PAYMENT_METHOD_LABELS[value] ?? PAYMENT_METHOD_LABELS[value.toLowerCase()] ?? toReadableEnum(value)
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