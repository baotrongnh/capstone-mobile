import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

interface PushNotificationToggleProps {
    enabled: boolean;
    loading: boolean;
    onToggle: () => void;
    title?: string;
    description?: string;
}

export default function PushNotificationToggle({
    enabled,
    loading,
    onToggle,
    title = "Thông báo đẩy",
    description = "Nhận thông báo khi có tin nhắn hoặc cập nhật mới.",
}: PushNotificationToggleProps) {
    return (
        <Pressable
            onPress={onToggle}
            disabled={loading}
            style={[styles.card, loading && styles.cardDisabled]}
        >
            <View style={styles.leftSection}>
                <View style={styles.iconWrap}>
                    <Ionicons name="notifications" size={20} color="#6b7280" />
                </View>
                <View style={styles.textWrap}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>

            <View
                style={[
                    styles.switchTrack,
                    enabled ? styles.switchTrackOn : styles.switchTrackOff,
                    loading && styles.switchTrackDisabled,
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <View style={[styles.switchThumb, enabled && styles.switchThumbOn]} />
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    cardDisabled: {
        opacity: 0.75,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: "#0f172a",
        fontWeight: "600",
    },
    description: {
        marginTop: 4,
        fontSize: 12,
        color: "#64748b",
        lineHeight: 18,
    },
    switchTrack: {
        width: 52,
        height: 30,
        borderRadius: 15,
        paddingHorizontal: 3,
        justifyContent: "center",
    },
    switchTrackOn: {
        backgroundColor: "#3b82f6",
    },
    switchTrackOff: {
        backgroundColor: "#cbd5e1",
    },
    switchTrackDisabled: {
        backgroundColor: "#94a3b8",
    },
    switchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        marginLeft: 0,
    },
    switchThumbOn: {
        marginLeft: "auto",
    },
});
