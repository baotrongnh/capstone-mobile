import { StyledContainer } from '@/components/styles'
import { useInvoices } from '@/hooks/query/useInvoice'
import {
    INVOICE_STATUS_TABS,
    type InvoiceStatus,
    type InvoiceItem
} from '@/types/invoice'
import { formatCurrency, formatDate } from '@/utils/invoices'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

type InvoiceTab = 'all' | InvoiceStatus

const VIETNAMESE_STATUS_LABELS: Partial<Record<InvoiceTab, string>> = {
    all: 'Tất cả',
    issued: 'Đã xuất',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy',
}

const VIETNAMESE_STATUS_VALUES: Record<string, string> = {
    issued: 'Đã xuất',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy',
    sent: 'Đã gửi',
}

export const formatStatusLabel = (status: InvoiceTab) => {
    return VIETNAMESE_STATUS_LABELS[status] || status
}

const getStatusStyle = (status?: string) => {
    switch (status) {
        case 'paid':
            return styles.statusPaid
        case 'overdue':
            return styles.statusOverdue
        case 'issued':
        case 'sent':
            return styles.statusIssued
        default:
            return styles.statusDefault
    }
}

const renderInvoiceItem = ({
    item,
    onPress,
}: {
    item: InvoiceItem
    onPress: (invoiceId: string) => void
}) => {
    return (
        <Pressable onPress={() => onPress(item.id)}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                    <Text style={[styles.status, getStatusStyle(item.status)]}>
                        {VIETNAMESE_STATUS_VALUES[item.status] || item.status}
                    </Text>
                </View>

                <Text style={styles.label}>Tổng tiền</Text>
                <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>

                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Hạn thanh toán</Text>
                        <Text style={styles.value}>{formatDate(item.dueDate)}</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>Loại hóa đơn</Text>
                        <Text style={styles.value}>{item.invoiceType || '--'}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default function Invoices() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<InvoiceTab>('all')
    const [tabsViewportWidth, setTabsViewportWidth] = useState(0)
    const [tabsContentWidth, setTabsContentWidth] = useState(0)
    const [showRightFade, setShowRightFade] = useState(false)
    const tabs = useMemo<InvoiceTab[]>(() => ['all', ...INVOICE_STATUS_TABS], [])
    const params = activeTab === 'all' ? undefined : { status: activeTab }

    const { data: allData } = useInvoices()
    const { data, isFetching, isRefetching, refetch, error } = useInvoices(params)
    const invoices = data?.data ?? []
    const allInvoices = useMemo(() => allData?.data ?? [], [allData])

    const tabCounts = useMemo<Partial<Record<InvoiceTab, number>>>(() => {
        const counts: Partial<Record<InvoiceTab, number>> = {
            all: allInvoices.length,
            issued: 0,
            paid: 0,
            overdue: 0,
            cancelled: 0,
        }

        allInvoices.forEach((invoice) => {
            const status = invoice.status as InvoiceStatus
            if (status in counts) {
                counts[status] = (counts[status] ?? 0) + 1
            }
        })

        return counts
    }, [allInvoices])

    const updateRightFade = (offsetX: number, viewport: number, content: number) => {
        const canScrollRight = offsetX + viewport < content - 4
        setShowRightFade(canScrollRight)
    }

    const handleTabsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x
        updateRightFade(offsetX, tabsViewportWidth, tabsContentWidth)
    }

    if (error) {
        return (
            <StyledContainer>
                <View style={styles.centered}>
                    <Text style={styles.errorTitle}>Không thể tải danh sách hóa đơn</Text>
                    <Text style={styles.errorMessage}>Hãy kéo để làm mới và thử lại.</Text>
                </View>
            </StyledContainer>
        )
    }

    return (
        <StyledContainer>
            <Text style={styles.title}>Danh sách hóa đơn</Text>

            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsContainer}
                    onLayout={(event) => {
                        const width = event.nativeEvent.layout.width
                        setTabsViewportWidth(width)
                        updateRightFade(0, width, tabsContentWidth)
                    }}
                    onContentSizeChange={(width) => {
                        setTabsContentWidth(width)
                        updateRightFade(0, tabsViewportWidth, width)
                    }}
                    onScroll={handleTabsScroll}
                    scrollEventThrottle={16}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                                >
                                    {formatStatusLabel(tab)}
                                </Text>
                            </Pressable>
                        )
                    })}
                </ScrollView>

                {showRightFade && (
                    <View pointerEvents='none' style={styles.tabsRightFade}>
                        <View style={[styles.fadeStep, styles.fadeStep1]} />
                        <View style={[styles.fadeStep, styles.fadeStep2]} />
                        <View style={[styles.fadeStep, styles.fadeStep3]} />
                        <View style={[styles.fadeStep, styles.fadeStep4]} />
                    </View>
                )}
            </View>

            <View style={styles.activeTabInfoRow}>
                <Text style={styles.activeTabInfoLabel}>Đang xem</Text>
                <Text style={styles.activeTabInfoStatus}>{formatStatusLabel(activeTab)}</Text>
                <View style={styles.activeTabCountPill}>
                    <Text style={styles.activeTabCountText}>{tabCounts[activeTab] ?? 0} hóa đơn</Text>
                </View>
            </View>

            {isFetching && !isRefetching && (
                <View style={styles.inlineLoadingWrap}>
                    <ActivityIndicator size='small' />
                    <Text style={styles.inlineLoadingText}>Đang tải hóa đơn..</Text>
                </View>
            )}

            <FlatList
                data={invoices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) =>
                    renderInvoiceItem({
                        item,
                        onPress: (invoiceId) =>
                            router.push({
                                pathname: '/invoices/[id]',
                                params: { id: invoiceId },
                            })
                    })
                }
                contentContainerStyle={invoices.length === 0 ? styles.emptyList : styles.list}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    isFetching ? null : (
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>Không có hóa đơn nào</Text>
                        </View>
                    )
                }
            />
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 10,
    },
    tabsWrapper: {
        position: 'relative',
        marginBottom: 8,
    },
    tabsScroll: {
        maxHeight: 42,
    },
    tabsContainer: {
        gap: 8,
        paddingVertical: 2,
        alignItems: 'center',
        paddingRight: 28,
    },
    tabsRightFade: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 32,
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    fadeStep: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    fadeStep1: {
        opacity: 0.08,
    },
    fadeStep2: {
        opacity: 0.2,
    },
    fadeStep3: {
        opacity: 0.45,
    },
    fadeStep4: {
        opacity: 0.75,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
    },
    tabButtonActive: {
        backgroundColor: '#1d4ed8',
        borderColor: '#1d4ed8',
    },
    tabLabel: {
        color: '#374151',
        fontWeight: 600,
        fontSize: 12,
        lineHeight: 14,
    },
    tabLabelActive: {
        color: '#ffffff',
    },
    activeTabInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    activeTabInfoLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    activeTabInfoStatus: {
        fontSize: 12,
        color: '#374151',
        fontWeight: 600,
    },
    activeTabCountPill: {
        backgroundColor: '#eef2ff',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    activeTabCountText: {
        fontSize: 11,
        color: '#4338ca',
        fontWeight: 600,
    },
    list: {
        gap: 12,
        paddingBottom: 20,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    invoiceNumber: {
        fontSize: 16,
        fontWeight: 700,
        flex: 1,
        marginRight: 10,
    },
    status: {
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    statusDefault: {
        color: '#1f2937',
        backgroundColor: '#f3f4f6',
    },
    statusIssued: {
        color: '#1d4ed8',
        backgroundColor: '#dbeafe',
    },
    statusPaid: {
        color: '#047857',
        backgroundColor: '#d1fae5',
    },
    statusOverdue: {
        color: '#b91c1c',
        backgroundColor: '#fee2e2',
    },
    label: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 4,
    },
    amount: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    value: {
        color: '#111827',
        fontSize: 14,
        fontWeight: 500,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineLoadingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    inlineLoadingText: {
        color: '#6b7280',
        fontSize: 13,
    },
    loadingText: {
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
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 15,
    },
})