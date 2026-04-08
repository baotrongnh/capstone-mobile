import { StyledContainer } from '@/components/styles'
import { useInvoice } from '@/hooks/query/useInvoice'
import type { InvoiceDetailContentItem, InvoiceDetailPayment } from '@/types/invoice'
import {
    formatCurrency,
    formatDate,
    formatInvoiceStatus,
    formatInvoiceType,
    formatPaymentMethod,
    getInvoiceStatusVariant,
    normalizeInvoiceText,
    toInvoiceRows,
} from '@/utils/invoices'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionBody}>{children}</View>
        </View>
    )
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            {typeof value === 'string' ? <Text style={styles.detailValue}>{value}</Text> : value}
        </View>
    )
}

export default function InvoiceDetailScreen() {
    const router = useRouter()
    const { id } = useLocalSearchParams()
    const routeId = Array.isArray(id) ? id[0] : id
    const invoiceId = typeof routeId === 'string' ? routeId : undefined

    const statusStyleByVariant = useMemo(
        () => ({
            default: styles.statusDefault,
            issued: styles.statusIssued,
            partial: styles.statusPartial,
            paid: styles.statusPaid,
            overdue: styles.statusOverdue,
            cancelled: styles.statusCancelled,
        }),
        []
    )

    const { data, isLoading, isError, error, refetch, isRefetching } = useInvoice(invoiceId)
    const invoice = data?.data

    const contentItems: InvoiceDetailContentItem[] = invoice?.invoiceContent?.items ?? []
    const payments: InvoiceDetailPayment[] = invoice?.payments ?? []

    const utilityRows = useMemo(() => toInvoiceRows(invoice?.utilityCharges), [invoice?.utilityCharges])
    const additionalRows = useMemo(() => toInvoiceRows(invoice?.additionalCharges), [invoice?.additionalCharges])
    const discountRows = useMemo(() => toInvoiceRows(invoice?.discounts), [invoice?.discounts])

    const overviewRows = useMemo(() => {
        if (!invoice) return [] as { label: string; value: React.ReactNode }[]

        return [
            { label: 'Mã hóa đơn', value: normalizeInvoiceText(invoice.invoiceNumber) },
            { label: 'Trạng thái', value: formatInvoiceStatus(invoice.status) },
            { label: 'Loại hóa đơn', value: formatInvoiceType(invoice.invoiceType) },
            { label: 'Tổng tiền', value: formatCurrency(invoice.totalAmount) },
            { label: 'Tiền thuê cơ bản', value: formatCurrency(invoice.baseRent) },
            { label: 'Thuế', value: formatCurrency(invoice.taxAmount) },
            { label: 'Tiền tệ', value: normalizeInvoiceText(invoice.currency) },
            { label: 'Kỳ từ', value: formatDate(invoice.billingPeriodStart) },
            { label: 'Kỳ đến', value: formatDate(invoice.billingPeriodEnd) },
            { label: 'Ngày xuất', value: formatDate(invoice.issueDate) },
            { label: 'Hạn thanh toán', value: formatDate(invoice.dueDate) },
            { label: 'Ngày gửi', value: formatDate(invoice.sentAt || undefined) },
            { label: 'Ngày thanh toán', value: formatDate(invoice.paidAt || undefined) },
            { label: 'Phương thức thanh toán', value: formatPaymentMethod(invoice.paymentMethod) },
            { label: 'Số hợp đồng', value: normalizeInvoiceText(invoice.contract?.contractNumber) },
            { label: 'Căn hộ', value: normalizeInvoiceText(invoice.contract?.apartment?.apartmentNumber) },
            { label: 'Ghi chú', value: normalizeInvoiceText(invoice.notes) },
            { label: 'Ngày tạo', value: formatDate(invoice.createdAt) },
            { label: 'Ngày cập nhật', value: formatDate(invoice.updatedAt) },
            { label: 'ID', value: normalizeInvoiceText(invoice.id) },
        ]
    }, [invoice])

    const openDocument = async (url: string) => {
        const canOpen = await Linking.canOpenURL(url)
        if (!canOpen) return
        await Linking.openURL(url)
    }

    const breadcrumbTitle = normalizeInvoiceText(invoice?.invoiceNumber || invoiceId || 'Chi tiết')

    return (
        <StyledContainer>
            <View style={styles.breadcrumbRow}>
                <Pressable style={styles.breadcrumbBack} onPress={() => router.push('/invoices')}>
                    <Ionicons name='chevron-back' size={16} color='#2563eb' />
                    <Text style={styles.breadcrumbBackText}>Hóa đơn</Text>
                </Pressable>
                <Ionicons name='chevron-forward' size={14} color='#9ca3af' />
                <Text numberOfLines={1} style={styles.breadcrumbCurrent}>{breadcrumbTitle}</Text>
            </View>

            {isLoading && (
                <View style={styles.centered}>
                    <ActivityIndicator size='large' />
                    <Text style={styles.helperText}>Đang tải chi tiết hóa đơn...</Text>
                </View>
            )}

            {isError && (
                <View style={styles.centered}>
                    <Text style={styles.errorTitle}>Không thể tải chi tiết hóa đơn</Text>
                    <Text style={styles.errorMessage}>{error instanceof Error ? error.message : 'Đã có lỗi xảy ra.'}</Text>
                    <Pressable style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryButtonText}>{isRefetching ? 'Đang tải...' : 'Thử lại'}</Text>
                    </Pressable>
                </View>
            )}

            {!isLoading && !isError && !invoice && (
                <View style={styles.centered}>
                    <Text style={styles.errorTitle}>Không tìm thấy hóa đơn</Text>
                    <Text style={styles.errorMessage}>Vui lòng kiểm tra lại mã hóa đơn.</Text>
                </View>
            )}

            {!isLoading && !isError && invoice && (
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <View>
                        <Text style={styles.title}>Chi tiết hóa đơn</Text>
                        <Text style={styles.subtitle}>#{normalizeInvoiceText(invoice.id)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Tổng tiền</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(invoice.totalAmount)}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Trạng thái</Text>
                            <Text style={[styles.statusChip, statusStyleByVariant[getInvoiceStatusVariant(invoice.status)]]}>
                                {formatInvoiceStatus(invoice.status)}
                            </Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Loại hóa đơn</Text>
                            <Text style={styles.summaryMinor}>{formatInvoiceType(invoice.invoiceType)}</Text>
                        </View>
                    </View>

                    <Section title='Tổng quan'>
                        {overviewRows.map((item) => (
                            <DetailRow key={item.label} label={item.label} value={item.value} />
                        ))}

                        <DetailRow
                            label='Tài liệu hóa đơn'
                            value={
                                invoice.invoiceDocumentUrl ? (
                                    <Pressable onPress={() => openDocument(invoice.invoiceDocumentUrl || '')}>
                                        <Text style={styles.documentLink}>Mở tài liệu</Text>
                                    </Pressable>
                                ) : (
                                    '--'
                                )
                            }
                        />
                    </Section>

                    <Section title='Nội dung hóa đơn'>
                        <DetailRow label='Tiêu đề' value={normalizeInvoiceText(invoice.invoiceContent?.title)} />
                        <DetailRow label='Mô tả' value={normalizeInvoiceText(invoice.invoiceContent?.description)} />

                        {contentItems.length === 0 ? (
                            <Text style={styles.emptyText}>Không có dòng nội dung.</Text>
                        ) : (
                            contentItems.map((item, index) => (
                                <View key={`${item.description}-${item.itemType}-${index}`} style={styles.subCard}>
                                    <DetailRow label='Mô tả' value={normalizeInvoiceText(item.description)} />
                                    <DetailRow label='Loại' value={formatInvoiceType(item.itemType)} />
                                    <DetailRow label='Số lượng' value={normalizeInvoiceText(item.quantity)} />
                                    <DetailRow label='Số tiền' value={formatCurrency(String(item.amount))} />
                                </View>
                            ))
                        )}
                    </Section>

                    <Section title='Phí tiện ích'>
                        {utilityRows.length === 0 ? (
                            <Text style={styles.emptyText}>Không có phí tiện ích.</Text>
                        ) : (
                            utilityRows.map((item) => (
                                <DetailRow key={item.key} label={item.key} value={item.value} />
                            ))
                        )}
                    </Section>

                    <Section title='Phí bổ sung'>
                        {additionalRows.length === 0 ? (
                            <Text style={styles.emptyText}>Không có phí bổ sung.</Text>
                        ) : (
                            additionalRows.map((item) => (
                                <DetailRow key={item.key} label={item.key} value={item.value} />
                            ))
                        )}
                    </Section>

                    <Section title='Giảm trừ'>
                        {discountRows.length === 0 ? (
                            <Text style={styles.emptyText}>Không có giảm trừ.</Text>
                        ) : (
                            discountRows.map((item) => (
                                <DetailRow key={item.key} label={item.key} value={item.value} />
                            ))
                        )}
                    </Section>

                    <Section title='Lịch sử thanh toán'>
                        {payments.length === 0 ? (
                            <Text style={styles.emptyText}>Chưa có thanh toán nào.</Text>
                        ) : (
                            payments.map((payment) => (
                                <View key={payment.id} style={styles.subCard}>
                                    <DetailRow label='Mã thanh toán' value={normalizeInvoiceText(payment.id)} />
                                    <DetailRow label='Phương thức' value={formatPaymentMethod(payment.paymentMethod)} />
                                    <DetailRow label='Ngày thanh toán' value={formatDate(payment.paymentDate)} />
                                    <DetailRow
                                        label='Trạng thái'
                                        value={
                                            <Text style={[styles.statusChip, statusStyleByVariant[getInvoiceStatusVariant(payment.status)]]}>
                                                {formatInvoiceStatus(payment.status)}
                                            </Text>
                                        }
                                    />
                                    <DetailRow label='Số tiền' value={formatCurrency(payment.amount)} />
                                </View>
                            ))
                        )}
                    </Section>
                </ScrollView>
            )}
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    breadcrumbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    breadcrumbBack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    breadcrumbBackText: {
        color: '#2563eb',
        fontSize: 13,
        fontWeight: 600,
    },
    breadcrumbCurrent: {
        flex: 1,
        color: '#374151',
        fontSize: 13,
        fontWeight: 500,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    summaryRow: {
        gap: 10,
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 700,
        color: '#111827',
    },
    summaryMinor: {
        fontSize: 15,
        fontWeight: 600,
        color: '#1f2937',
    },
    section: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#111827',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    sectionBody: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'flex-start',
    },
    detailLabel: {
        flex: 1,
        fontSize: 13,
        color: '#6b7280',
    },
    detailValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: 13,
        color: '#111827',
        fontWeight: 500,
    },
    statusChip: {
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    statusDefault: {
        color: '#1f2937',
        backgroundColor: '#f3f4f6',
    },
    statusIssued: {
        color: '#1d4ed8',
        backgroundColor: '#dbeafe',
    },
    statusPartial: {
        color: '#a16207',
        backgroundColor: '#fef3c7',
    },
    statusPaid: {
        color: '#047857',
        backgroundColor: '#d1fae5',
    },
    statusOverdue: {
        color: '#b91c1c',
        backgroundColor: '#fee2e2',
    },
    statusCancelled: {
        color: '#9f1239',
        backgroundColor: '#fce7f3',
    },
    subCard: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 10,
        gap: 6,
        backgroundColor: '#f9fafb',
    },
    emptyText: {
        fontSize: 13,
        color: '#6b7280',
    },
    documentLink: {
        color: '#2563eb',
        fontSize: 13,
        fontWeight: 600,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    helperText: {
        marginTop: 10,
        color: '#6b7280',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#b91c1c',
        marginBottom: 8,
    },
    errorMessage: {
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#1d4ed8',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: 700,
    },
})
