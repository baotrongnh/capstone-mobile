import { StyledContainer } from '@/components/styles'
import { useInvoice } from '@/hooks/query/useInvoice'
import { formatCurrency, formatInvoiceStatus, normalizeInvoiceText } from '@/utils/invoices'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

export default function PaymentSuccessScreen() {
    const router = useRouter()
    const { invoiceId } = useLocalSearchParams<{ invoiceId?: string }>()
    const id = Array.isArray(invoiceId) ? invoiceId[0] : invoiceId

    const { data, isLoading, isError, error } = useInvoice(id)
    const invoice = data?.data

    return (
        <StyledContainer>
            <View style={styles.centered}>
                {isLoading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size='large' />
                        <Text style={styles.helperText}>Đang tải thông tin hóa đơn...</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Ionicons name='checkmark-circle' size={74} color='#16a34a' />
                        <Text style={styles.title}>Thanh toán thành công</Text>
                        <Text style={styles.subtitle}>Hóa đơn đã được thanh toán và cập nhật trạng thái.</Text>

                        {isError && (
                            <Text style={styles.warningText}>
                                {error instanceof Error ? error.message : 'Không thể tải chi tiết hóa đơn.'}
                            </Text>
                        )}

                        {invoice && (
                            <View style={styles.infoBlock}>
                                <Text style={styles.infoLabel}>Mã hóa đơn</Text>
                                <Text style={styles.infoValue}>{normalizeInvoiceText(invoice.invoiceNumber)}</Text>

                                <Text style={styles.infoLabel}>Invoice ID</Text>
                                <Text style={styles.infoValue}>{normalizeInvoiceText(invoice.id)}</Text>

                                <Text style={styles.infoLabel}>Tổng tiền</Text>
                                <Text style={styles.infoValue}>{formatCurrency(invoice.totalAmount)}</Text>

                                <Text style={styles.infoLabel}>Trạng thái</Text>
                                <Text style={styles.infoValue}>{formatInvoiceStatus(invoice.status)}</Text>
                            </View>
                        )}

                        <Pressable style={styles.primaryButton} onPress={() => router.replace('/invoices')}>
                            <Text style={styles.primaryButtonText}>Về danh sách hóa đơn</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingWrap: {
        alignItems: 'center',
    },
    helperText: {
        marginTop: 10,
        color: '#6b7280',
    },
    card: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        padding: 18,
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
    },
    warningText: {
        color: '#b45309',
        fontSize: 13,
        textAlign: 'center',
    },
    infoBlock: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        padding: 12,
        gap: 4,
    },
    infoLabel: {
        color: '#6b7280',
        fontSize: 12,
    },
    infoValue: {
        color: '#111827',
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 6,
    },
    primaryButton: {
        width: '100%',
        marginTop: 8,
        backgroundColor: '#1d4ed8',
        borderRadius: 12,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 700,
    },
})
