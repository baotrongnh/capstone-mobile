import React from "react"
import { StyleSheet, Text, View } from "react-native"

type DetailRowProps = {
    label: string
    value: string
}

export default function DetailRow({ label, value }: DetailRowProps) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    detailRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 8,
        marginBottom: 2,
        gap: 2,
    },
    detailLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    detailValue: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "700",
    },
})
