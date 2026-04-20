import React, { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
    BackButton,
    Container,
    HeaderBar,
    ScrollContainer,
} from "./styles";
import { usePushNotificationSetting } from "@/hooks/usePushNotificationSetting";
import PushNotificationToggle from "./PushNotificationToggle";

interface SettingsProps {
    onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
    const { isEnabled, isLoading, isUpdating, setPushEnabled } = usePushNotificationSetting();

    const handleToggle = useCallback(() => {
        void setPushEnabled(!isEnabled);
    }, [isEnabled, setPushEnabled]);

    return (
        <Container>
            <HeaderBar style={styles.header}>
                <BackButton style={styles.backButton} onPress={onBack}>
                    <Ionicons name="chevron-back" size={24} color="#334155" />
                </BackButton>
                <Text style={styles.headerTitle}>Cài đặt</Text>
            </HeaderBar>

            <ScrollContainer style={styles.content}>
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Thông báo</Text>
                    <Text style={styles.sectionDescription}>
                        Tuỳ chỉnh cách ứng dụng gửi thông báo đến thiết bị của bạn.
                    </Text>

                    {isLoading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="small" color="#2563eb" />
                            <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
                        </View>
                    ) : (
                        <PushNotificationToggle
                            enabled={isEnabled}
                            loading={isUpdating}
                            onToggle={handleToggle}
                            title="Bật thông báo đẩy"
                            description="Bật để nhận tin nhắn mới, nhắc nhở thanh toán và các cập nhật quan trọng."
                        />
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Ngôn ngữ</Text>
                    <Text style={styles.languageValue}>Tiếng Việt</Text>
                    <Text style={styles.languageHint}>
                        Nội dung cài đặt đã được hiển thị bằng tiếng Việt.
                    </Text>
                </View>
            </ScrollContainer>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    headerTitle: {
        flex: 1,
        marginLeft: 10,
        fontSize: 22,
        fontWeight: "700",
        color: "#0f172a",
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionCard: {
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    sectionDescription: {
        marginTop: 5,
        marginBottom: 8,
        fontSize: 13,
        color: "#64748b",
        lineHeight: 18,
    },
    loadingState: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
    },
    loadingText: {
        fontSize: 13,
        color: "#64748b",
    },
    languageValue: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "600",
        color: "#334155",
    },
    languageHint: {
        marginTop: 4,
        fontSize: 12,
        color: "#94a3b8",
    },
});
