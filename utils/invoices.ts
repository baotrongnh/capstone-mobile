export type InvoiceStatusVariant = 'default' | 'issued' | 'partial' | 'paid' | 'overdue' | 'cancelled'

const STATUS_LABELS: Record<string, string> = {
    draft: 'Nháp',
    issued: 'Đã xuất',
    sent: 'Đã gửi',
    partially_paid: 'Thanh toán một phần',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy',
}

const INVOICE_TYPE_LABELS: Record<string, string> = {
    rent: 'Tiền thuê',
    electricity: 'Điện',
    water: 'Nước',
    maintenance: 'Bảo trì',
    deposit: 'Đặt cọc',
    contractDeposit: 'Đặt cọc hợp đồng',
    contract_deposit: 'Đặt cọc hợp đồng',
    utility: 'Tiện ích',
    service: 'Dịch vụ',
    penalty: 'Phạt',
    other: 'Khác',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    bank_transfer: 'Chuyển khoản',
    bankTransfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
    e_wallet: 'Ví điện tử',
    eWallet: 'Ví điện tử',
    auto_debit: 'Tự động trích nợ',
    autoDebit: 'Tự động trích nợ',
    credit_card: 'Thẻ tín dụng',
    creditCard: 'Thẻ tín dụng',
    debit_card: 'Thẻ ghi nợ',
    debitCard: 'Thẻ ghi nợ',
}

export type InvoiceInfoRow = { key: string; value: string }

export const formatCurrency = (amount?: string | number | null) => {
    const parsed = typeof amount === 'number' ? amount : Number(amount)
    if (!Number.isFinite(parsed)) return '--'
    return `${parsed.toLocaleString('vi-VN')} VND`
}

export const formatDate = (value?: string | null) => {
    if (!value) return '--'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '--'
    return date.toLocaleDateString('vi-VN')
}

export const normalizeInvoiceText = (value: unknown) => {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : '--'
    }

    if (typeof value === 'number') {
        return String(value)
    }

    return '--'
}

export const formatInvoiceType = (value?: string | null) => {
    if (!value) return '--'
    return INVOICE_TYPE_LABELS[value] || value
}

export const formatPaymentMethod = (value?: string | null) => {
    if (!value) return '--'
    return PAYMENT_METHOD_LABELS[value] || value
}

export const formatInvoiceStatus = (value?: string | null) => {
    if (!value) return '--'
    return STATUS_LABELS[value] || value
}

const prettifyChargeKey = (key: string) => {
    const normalized = key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()

    if (!normalized) return '--'

    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const toInvoiceRows = (value: unknown): InvoiceInfoRow[] => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return []
    }

    return Object.entries(value as Record<string, unknown>).map(([key, rowValue]) => ({
        key: prettifyChargeKey(key),
        value: normalizeInvoiceText(rowValue),
    }))
}

export const getInvoiceStatusVariant = (status?: string): InvoiceStatusVariant => {
    switch (status) {
        case 'paid':
            return 'paid'
        case 'overdue':
            return 'overdue'
        case 'issued':
        case 'sent':
            return 'issued'
        case 'partially_paid':
            return 'partial'
        case 'cancelled':
            return 'cancelled'
        default:
            return 'default'
    }
}


