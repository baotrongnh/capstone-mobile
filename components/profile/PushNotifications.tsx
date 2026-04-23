import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
  ScrollContainer,
  HeaderBar,
  BackButton,
} from "./styles";
import { usePushNotificationSetting } from "@/hooks/usePushNotificationSetting";
import PushNotificationToggle from "./PushNotificationToggle";

interface PushNotificationsProps {
  onBack: () => void;
}

export default function PushNotifications({ onBack }: PushNotificationsProps) {
  const { isEnabled, isLoading, isUpdating, errorMessage, setPushEnabled } = usePushNotificationSetting();

  const handleToggle = useCallback(() => {
    void setPushEnabled(!isEnabled);
  }, [isEnabled, setPushEnabled]);

  return (
    <Container>
      <HeaderBar style={styles.header}>
        <BackButton style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </BackButton>
        <Text style={styles.headerTitle}>Thông báo đẩy</Text>
      </HeaderBar>
      <ScrollContainer style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tuỳ chọn thông báo</Text>
          <Text style={styles.cardDescription}>
            Bật để nhận thông báo khi có tin nhắn, nhắc thanh toán hoặc cập nhật quan trọng.
          </Text>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
            </View>
          ) : (
            <>
              <PushNotificationToggle
                enabled={isEnabled}
                loading={isUpdating}
                onToggle={handleToggle}
                title="Bật thông báo đẩy"
                description="Nhận thông báo ngay khi có hoạt động mới liên quan đến tài khoản của bạn."
              />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </>
          )}
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
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDescription: {
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
  errorText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#b91c1c",
  },
});
