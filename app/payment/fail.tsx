import { StyledContainer } from '@/components/styles'
import { useInvoice } from '@/hooks/query/useInvoice'
import { formatCurrency, formatInvoiceStatus, normalizeInvoiceText } from '@/utils/invoices'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function PaymentFailScreen() {
    const router = useRouter()
    const { invoiceId, reason } = useLocalSearchParams<{ invoiceId?: string; reason?: string }>()
    const id = Array.isArray(invoiceId) ? invoiceId[0] : invoiceId
    const rawReason = Array.isArray(reason) ? reason[0] : reason

    const { data } = useInvoice(id)
    const invoice = data?.data

    return (
        <StyledContainer>
            <View style={styles.centered}>
                <View style={styles.card}>
                    <Ionicons name='close-circle' size={74} color='#dc2626' />
                    <Text style={styles.title}>Thanh toán thất bại</Text>
                    <Text style={styles.subtitle}>Không thể hoàn tất thanh toán cho hóa đơn này.</Text>

                    {rawReason && (
                        <Text style={styles.reasonText}>Chi tiết: {rawReason}</Text>
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
    card: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
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
    reasonText: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
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
