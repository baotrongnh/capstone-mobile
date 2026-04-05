import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"

type ApartmentHeaderProps = {
    apartmentTitle: string
    address: string
    statusLabel: string
    statusBackgroundColor: string
    statusTextColor: string
    isPrimaryTenant: boolean
    apartmentImage?: string
}

export default function ApartmentHeader({
    apartmentTitle,
    address,
    statusLabel,
    statusBackgroundColor,
    statusTextColor,
    isPrimaryTenant,
    apartmentImage,
}: ApartmentHeaderProps) {
    return (
        <>
            <View style={styles.headerCard}>
                <View style={styles.headerIconWrap}>
                    <MaterialCommunityIcons name="home-city-outline" size={24} color="#1d4ed8" />
                </View>

                <View style={styles.headerBody}>
                    <Text style={styles.headerTitle}>Căn hộ của tôi</Text>
                    <Text numberOfLines={1} style={styles.headerApartmentName}>
                        {apartmentTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.headerAddress}>
                        {address}
                    </Text>
                </View>
            </View>

            <View style={styles.badgesContainer}>
                <View style={[styles.badge, { backgroundColor: statusBackgroundColor }]}>
                    <Text style={[styles.badgeText, { color: statusTextColor }]}>{statusLabel}</Text>
                </View>

                <View
                    style={[
                        styles.badge,
                        isPrimaryTenant ? styles.primaryBadge : styles.secondaryBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.badgeText,
                            isPrimaryTenant ? styles.primaryBadgeText : styles.secondaryBadgeText,
                        ]}
                    >
                        {isPrimaryTenant ? "Cư dân chính" : "Cư dân phụ"}
                    </Text>
                </View>
            </View>

            {apartmentImage ? (
                <Image source={{ uri: apartmentImage }} style={styles.apartmentImage} resizeMode="cover" />
            ) : null}
        </>
    )
}

const styles = StyleSheet.create({
    headerCard: {
        borderRadius: 20,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe5f3",
        padding: 16,
        flexDirection: "row",
        gap: 12,
    },
    headerIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eff6ff",
    },
    headerBody: {
        flex: 1,
        gap: 2,
    },
    headerTitle: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "600",
    },
    headerApartmentName: {
        fontSize: 22,
        color: "#0f172a",
        fontWeight: "800",
    },
    headerAddress: {
        marginTop: 3,
        fontSize: 13,
        color: "#64748b",
    },
    badgesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    primaryBadge: {
        backgroundColor: "#dbeafe",
    },
    secondaryBadge: {
        backgroundColor: "#e5e7eb",
    },
    primaryBadgeText: {
        color: "#1d4ed8",
    },
    secondaryBadgeText: {
        color: "#374151",
    },
    apartmentImage: {
        width: "100%",
        height: 190,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#dbe5f3",
        backgroundColor: "#ffffff",
    },
})
