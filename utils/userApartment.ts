const EMPTY_TEXT = "--"

type StatusMeta = {
    label: string
    backgroundColor: string
    textColor: string
}

const APARTMENT_STATUS_META: Record<string, StatusMeta> = {
    available: { label: "Sẵn sàng", backgroundColor: "#dcfce7", textColor: "#166534" },
    occupied: { label: "Đang ở", backgroundColor: "#dbeafe", textColor: "#1d4ed8" },
    rented: { label: "Đang thuê", backgroundColor: "#dbeafe", textColor: "#1d4ed8" },
    maintenance: { label: "Bảo trì", backgroundColor: "#ffedd5", textColor: "#9a3412" },
    reserved: { label: "Đã đặt", backgroundColor: "#ede9fe", textColor: "#5b21b6" },
    unavailable: { label: "Không khả dụng", backgroundColor: "#fee2e2", textColor: "#b91c1c" },
    inactive: { label: "Ngừng hoạt động", backgroundColor: "#e5e7eb", textColor: "#374151" },
}

const TENANT_STATUS_LABELS: Record<string, string> = {
    active: "Đang ở",
    moved_out: "Đã chuyển đi",
    inactive: "Không hoạt động",
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null
}

const toFiniteNumber = (value: unknown): number | undefined => {
    const parsed = typeof value === "number" ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

const toWords = (value: string) =>
    value
        .split("_")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase())

export const toDisplayText = (value: unknown, fallback = EMPTY_TEXT): string => {
    if (typeof value === "string") {
        const normalized = value.trim()
        return normalized.length > 0 ? normalized : fallback
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value)
    }

    return fallback
}

export const toReadableStatus = (value: unknown, fallback = EMPTY_TEXT): string => {
    const text = toDisplayText(value, fallback)
    if (text === fallback) return text
    return toWords(text)
}

export const formatTenantStatus = (value: unknown): string => {
    if (typeof value !== "string") return EMPTY_TEXT
    return TENANT_STATUS_LABELS[value] ?? toWords(value)
}

export const getApartmentStatusMeta = (value: unknown): StatusMeta => {
    if (typeof value !== "string") {
        return APARTMENT_STATUS_META.inactive
    }

    return APARTMENT_STATUS_META[value] ?? {
        label: toWords(value),
        backgroundColor: "#e5e7eb",
        textColor: "#374151",
    }
}

export const formatDate = (value: unknown): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        return EMPTY_TEXT
    }

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
        return EMPTY_TEXT
    }

    return parsedDate.toLocaleDateString("vi-VN")
}

export const formatCurrency = (value: unknown): string => {
    const parsed = toFiniteNumber(value)
    if (parsed === undefined) return EMPTY_TEXT
    return `${parsed.toLocaleString("vi-VN")} VND`
}

export const formatArea = (value: unknown): string => {
    const parsed = toFiniteNumber(value)
    if (parsed === undefined) return EMPTY_TEXT
    return `${parsed.toLocaleString("vi-VN")} m2`
}

export const formatAmenities = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []

    return value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => toWords(item.toLowerCase()))
}

export const formatAddress = (streetAddress: unknown, wardCode: unknown, provinceCode: unknown): string => {
    const street = toDisplayText(streetAddress, "")
    const ward = toFiniteNumber(wardCode)
    const province = toFiniteNumber(provinceCode)

    const parts: string[] = []
    if (street) parts.push(street)
    if (ward !== undefined) parts.push(`Phường ${ward}`)
    if (province !== undefined) parts.push(`Tỉnh/TP ${province}`)

    if (parts.length === 0) return EMPTY_TEXT
    return parts.join(", ")
}

export const maskSecret = (value: unknown): string => {
    const text = toDisplayText(value, EMPTY_TEXT)
    if (text === EMPTY_TEXT) return text
    return "*".repeat(Math.max(6, text.length))
}

export const isValidHousePassword = (value: string): boolean => {
    return /^\d{4,12}$/.test(value)
}

export const getApiErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại."): string => {
    if (!isRecord(error)) {
        return fallback
    }

    const response = error.response
    if (isRecord(response)) {
        const responseData = response.data
        if (isRecord(responseData)) {
            const message = responseData.message
            if (Array.isArray(message)) {
                const firstMessage = message.find((item) => typeof item === "string" && item.trim().length > 0)
                if (firstMessage) {
                    return firstMessage
                }
            }

            if (typeof message === "string" && message.trim().length > 0) {
                return message
            }
        }
    }

    if (typeof error.message === "string" && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

export const extractFirstImage = (images: unknown): string | undefined => {
    if (!Array.isArray(images)) {
        return undefined
    }

    return images.find((image): image is string => typeof image === "string" && image.trim().length > 0)
}
