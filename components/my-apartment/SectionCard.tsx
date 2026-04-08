import React, { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"

type SectionCardProps = {
    title: string
    children: ReactNode
}

export default function SectionCard({ title, children }: SectionCardProps) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    sectionCard: {
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 14,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: 4,
    },
})
