import { StyledContainer } from '@/components/styles'
import { useInvoice } from '@/hooks/query/useInvoice'
import { useCreatePayOSPaymentLink } from '@/hooks/query/usePayments'
import type { InvoiceDetailContentItem } from '@/types/invoice'
import { toPayOSPayloadLog } from '@/utils/payment'
import {
    formatCurrency,
    formatDate,
    formatInvoiceStatus,
    formatInvoiceType,
    formatPaymentMethod,
    getInvoiceStatusVariant,
    normalizeInvoiceText,
} from '@/utils/invoices'
import { Ionicons } from '@expo/vector-icons'
import * as ExpoLinking from 'expo-linking'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useMemo } from 'react'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const getErrorMessage = (errorValue: unknown) => {
    if (typeof errorValue !== 'object' || errorValue === null) {
        return 'Không thể tạo link thanh toán. Vui lòng thử lại.'
    }

    const maybeResponse = errorValue as {
        response?: { data?: { message?: string | string[] } }
    }
    const message = maybeResponse.response?.data?.message

    if (Array.isArray(message) && message.length > 0) {
        return message[0]
    }

    if (typeof message === 'string' && message.trim().length > 0) {
        return message
    }

    if (errorValue instanceof Error && errorValue.message.trim().length > 0) {
        return errorValue.message
    }

    return 'Không thể tạo link thanh toán. Vui lòng thử lại.'
}

const getQueryValue = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0]
    }

    return undefined
}

const APP_DEEP_LINK_SCHEME = 'homeiq'

const normalizeComparableText = (value: unknown) => String(value ?? '').trim().toLowerCase()

const isSameContentText = (left: unknown, right: unknown) => {
    const normalizedLeft = normalizeComparableText(left)
    const normalizedRight = normalizeComparableText(right)

    return normalizedLeft.length > 0 && normalizedLeft === normalizedRight
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionBody}>{children}</View>
        </View>
    )
}

const DetailRow = ({
    label,
    value,
    isLast = false,
}: {
    label: string
    value: React.ReactNode
    isLast?: boolean
}) => {
    return (
        <View style={[styles.detailRow, !isLast && styles.detailRowBordered]}>
            <Text style={styles.detailLabel}>{label}</Text>
            {typeof value === 'string' ? <Text style={styles.detailValue}>{value}</Text> : value}
        </View>
    )
}

export default function InvoiceDetailScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
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
    const { mutateAsync: createPayOSPaymentLink, isPending: isCreatingPayOSPaymentLink } = useCreatePayOSPaymentLink()
    const invoice = data?.data
    const isPaying = isCreatingPayOSPaymentLink
    const invoiceStatus = String(invoice?.status || '').toLowerCase()
    const canPayNow = ['issued', 'overdue'].includes(invoiceStatus)

    const contentItems: InvoiceDetailContentItem[] = invoice?.invoiceContent?.items ?? []

    const overviewRows = useMemo(() => {
        if (!invoice) return [] as { label: string; value: React.ReactNode }[]

        return [
            { label: 'Số hóa đơn', value: normalizeInvoiceText(invoice.invoiceNumber) },
            { label: 'Mã căn hộ', value: normalizeInvoiceText(invoice.contract?.apartment?.apartmentNumber) },
            { label: 'Trạng thái', value: formatInvoiceStatus(invoice.status) },
            { label: 'Loại hóa đơn', value: formatInvoiceType(invoice.invoiceType) },
            { label: 'Kỳ thanh toán bắt đầu', value: formatDate(invoice.billingPeriodStart) },
            { label: 'Hạn thanh toán', value: formatDate(invoice.dueDate) },
            { label: 'Ngày phát hành', value: formatDate(invoice.issueDate) },
            { label: 'Ngày thanh toán', value: formatDate(invoice.paidAt || undefined) },
            { label: 'Tiền tệ', value: normalizeInvoiceText(invoice.currency) },
            { label: 'Phương thức thanh toán', value: formatPaymentMethod(invoice.paymentMethod) },
            { label: 'Tổng tiền', value: formatCurrency(invoice.totalAmount) },
            { label: 'Ngày tạo', value: formatDate(invoice.createdAt) },
            { label: 'Mã hóa đơn', value: normalizeInvoiceText(invoice.id) },
        ]
    }, [invoice])

    const shouldShowContentDescription = useMemo(() => {
        if (!invoice) return false
        if (contentItems.length !== 1) return true

        const invoiceDescription = invoice.invoiceContent?.description
        const firstItemDescription = contentItems[0]?.description

        return !isSameContentText(invoiceDescription, firstItemDescription)
    }, [invoice, contentItems])

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back()
            return
        }

        router.replace('/invoices')
    }

    const handlePayNow = async () => {
        if (!invoice?.id) {
            Alert.alert('Không tìm thấy hóa đơn', 'Vui lòng tải lại trang và thử lại.')
            return
        }

        const returnUrl = ExpoLinking.createURL('/payment/success', {
            scheme: APP_DEEP_LINK_SCHEME,
            queryParams: {
                invoiceId: invoice.id,
                source: 'payos',
            },
        })
        const cancelUrl = ExpoLinking.createURL('/payment/fail', {
            scheme: APP_DEEP_LINK_SCHEME,
            queryParams: {
                invoiceId: invoice.id,
                source: 'payos',
                reason: 'Bạn đã hủy thanh toán.',
            },
        })
        const authSessionRedirectUrl = ExpoLinking.createURL('/payment', {
            scheme: APP_DEEP_LINK_SCHEME,
        })
        const descriptionSource = invoice.invoiceNumber || invoice.id
        const description = `TT ${descriptionSource}`.slice(0, 25)
        const paymentPayload = {
            invoiceId: invoice.id,
            returnUrl,
            cancelUrl,
            description,
        }

        try {
            console.log('[PAYOS] callback urls sent to BE', {
                returnUrl,
                cancelUrl,
                authSessionRedirectUrl,
                scheme: APP_DEEP_LINK_SCHEME,
            })

            console.log('[PAYOS] handlePayNow start', {
                authSessionRedirectUrl,
                request: toPayOSPayloadLog(paymentPayload),
            })

            const response = await createPayOSPaymentLink(paymentPayload)

            const checkoutUrl = response.data?.checkoutUrl
            console.log('[PAYOS] handlePayNow create-link result', {
                paymentId: response.data?.paymentId,
                paymentReference: response.data?.paymentReference,
                checkoutUrl,
            })

            if (!checkoutUrl) {
                Alert.alert('Không thể thanh toán', 'Không tìm thấy liên kết thanh toán từ hệ thống.')
                return
            }

            const authSession = await WebBrowser.openAuthSessionAsync(checkoutUrl, authSessionRedirectUrl)
            const authSessionUrl = 'url' in authSession ? authSession.url : undefined

            console.log('[PAYOS] auth-session result', {
                type: authSession.type,
                url: authSessionUrl,
            })

            if (authSession.type !== 'success') {
                const reason = authSession.type === 'cancel'
                    ? 'Bạn đã hủy thanh toán.'
                    : 'Không hoàn tất được phiên thanh toán.'

                router.replace({
                    pathname: '/payment/fail',
                    params: {
                        invoiceId: invoice.id,
                        reason,
                    },
                })
                return
            }

            const redirectUrl = authSessionUrl || ''
            const redirectPath = redirectUrl.split('?')[0]?.toLowerCase() || ''
            const parsed = ExpoLinking.parse(redirectUrl)
            const redirectedInvoiceId = getQueryValue(parsed.queryParams?.invoiceId) || invoice.id

            if (redirectPath.includes('/payment/success')) {
                router.replace({
                    pathname: '/payment/success',
                    params: { invoiceId: redirectedInvoiceId },
                })
                return
            }

            if (redirectPath.includes('/payment/fail') || redirectPath.includes('/payment/cancel')) {
                const reason = getQueryValue(parsed.queryParams?.reason)
                router.replace({
                    pathname: '/payment/fail',
                    params: {
                        invoiceId: redirectedInvoiceId,
                        reason,
                    },
                })
                return
            }

            router.replace({
                pathname: '/payment/success',
                params: { invoiceId: redirectedInvoiceId },
            })
        } catch (errorValue) {
            const reason = getErrorMessage(errorValue)
            console.log('[PAYOS] handlePayNow failed', {
                invoiceId: invoice.id,
                reason,
                message: errorValue instanceof Error ? errorValue.message : 'Unknown error',
            })

            router.replace({
                pathname: '/payment/fail',
                params: {
                    invoiceId: invoice.id,
                    reason,
                },
            })
        }
    }

    return (
        <StyledContainer>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleBack} hitSlop={10}>
                    <Ionicons name='chevron-back' size={24} color='#334155' />
                </Pressable>
                <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
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
                <View style={styles.contentWrap}>
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={[
                            styles.scrollContent,
                            canPayNow && styles.scrollContentWithBottomAction,
                        ]}
                    >
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
                            {overviewRows.map((item, index) => (
                                <DetailRow
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    isLast={index === overviewRows.length - 1}
                                />
                            ))}
                        </Section>

                        <Section title='Nội dung hóa đơn'>
                            <DetailRow
                                label='Tiêu đề'
                                value={normalizeInvoiceText(invoice.invoiceContent?.title)}
                                isLast={!shouldShowContentDescription && contentItems.length === 0}
                            />
                            {shouldShowContentDescription && (
                                <DetailRow
                                    label='Mô tả'
                                    value={normalizeInvoiceText(invoice.invoiceContent?.description)}
                                    isLast={contentItems.length === 0}
                                />
                            )}

                            {contentItems.length === 0 ? (
                                <Text style={styles.emptyText}>Không có hạng mục hóa đơn</Text>
                            ) : (
                                contentItems.map((item, index) => (
                                    <View key={`${item.description}-${item.itemType}-${index}`} style={styles.subCard}>
                                        <DetailRow label='Mô tả' value={normalizeInvoiceText(item.description)} />
                                        <DetailRow label='Loại' value={formatInvoiceType(item.itemType)} />
                                        <DetailRow label='Số lượng' value={normalizeInvoiceText(item.quantity)} />
                                        <DetailRow label='Số tiền' value={formatCurrency(String(item.amount))} isLast />
                                    </View>
                                ))
                            )}
                        </Section>
                    </ScrollView>

                    {canPayNow && (
                        <View style={[styles.payActionWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                            <Pressable
                                style={[styles.payActionButton, isPaying && styles.payActionButtonDisabled]}
                                onPress={() => void handlePayNow()}
                                disabled={isPaying}
                            >
                                <Ionicons name='card-outline' size={18} color='#ffffff' />
                                <Text style={styles.payActionButtonText}>
                                    {isPaying ? 'Đang mở cổng thanh toán...' : 'Thanh toán'}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            )}
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 18,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        marginLeft: 10,
        fontSize: 22,
        fontWeight: 700,
        color: '#0f172a',
    },
    scroll: {
        flex: 1,
    },
    contentWrap: {
        flex: 1,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 24,
    },
    scrollContentWithBottomAction: {
        paddingBottom: 126,
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
        paddingVertical: 7,
    },
    detailRowBordered: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailLabel: {
        width: '42%',
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 20,
    },
    detailValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: 13,
        color: '#111827',
        fontWeight: 500,
        lineHeight: 20,
        flexShrink: 1,
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
        backgroundColor: '#f8fafc',
    },
    emptyText: {
        fontSize: 13,
        color: '#6b7280',
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
    payActionWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    payActionButton: {
        backgroundColor: '#1d4ed8',
        borderRadius: 12,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    payActionButtonDisabled: {
        opacity: 0.65,
    },
    payActionButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 700,
    },
})
