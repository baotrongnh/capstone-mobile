export const formatCurrency = (amount?: string) => {
    const parsed = Number(amount)
    if (!Number.isFinite(parsed)) return '--'
    return `${parsed.toLocaleString('vi-VN')} VND`
}

export const formatDate = (value?: string) => {
    if (!value) return '--'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '--'
    return date.toLocaleDateString('vi-VN')
}


