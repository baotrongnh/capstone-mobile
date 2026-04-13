import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
  ScrollContainer,
  HeaderBar,
  BackButton,
  MenuItem,
  MenuLeft,
  MenuIcon,
  MenuText,
} from "./styles";

interface PushNotificationsProps {
  onBack: () => void;
}

export default function PushNotifications({ onBack }: PushNotificationsProps) {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <Container>
      <HeaderBar style={styles.header}>
        <BackButton style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </BackButton>
        <Text style={styles.headerTitle}>Thông báo đẩy</Text>
      </HeaderBar>
      <ScrollContainer style={{ padding: 20 }}>
        <MenuItem
          style={{ marginBottom: 0 }}
          onPress={() => setIsEnabled(!isEnabled)}
        >
          <MenuLeft>
            <MenuIcon>
              <Ionicons name="notifications" size={20} color="#6b7280" />
            </MenuIcon>
            <View>
              <MenuText>Push Notifications</MenuText>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                Get notified when you receive messages
              </Text>
            </View>
          </MenuLeft>
          <View
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              backgroundColor: isEnabled ? "#3b82f6" : "#d1d5db",
              justifyContent: "center",
              paddingHorizontal: 2,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#ffffff",
                marginLeft: isEnabled ? "auto" : undefined,
              }}
            />
          </View>
        </MenuItem>
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
});
