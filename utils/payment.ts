import type { CreatePayOSPaymentLinkBody, PaymentStatus } from "@/types/payment"

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
    pending: "#f59e0b",
    processing: "#2563eb",
    completed: "#16a34a",
    failed: "#dc2626",
    refunded: "#7c3aed",
    cancelled: "#6b7280",
}

export const PAYMENT_STATUS_TABS: PaymentStatus[] = [
    "completed",
    "failed",
    "refunded",
]

export const toPayOSPayloadLog = (payload: CreatePayOSPaymentLinkBody) => ({
    invoiceId: payload.invoiceId,
    returnUrl: payload.returnUrl,
    cancelUrl: payload.cancelUrl,
    description: payload.description,
})