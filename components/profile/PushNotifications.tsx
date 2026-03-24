import React, { useState } from "react";
import { View, Text } from "react-native";
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
      <HeaderBar>
        <BackButton onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </BackButton>
      </HeaderBar>
      <ScrollContainer style={{ padding: 20 }}>
        <MenuItem
          style={{ marginBottom: 0 }}
          onPress={() => setIsEnabled(!isEnabled)}
        >
          <MenuLeft>
            <MenuIcon style={{ backgroundColor: "#ec482920" }}>
              <Ionicons name="notifications" size={20} color="#ec4899" />
            </MenuIcon>
            <View>
              <MenuText>Push Notifications</MenuText>
              <Text style={{ fontSize: 12, color: "#778088", marginTop: 4 }}>
                Get notified when you receive messages
              </Text>
            </View>
          </MenuLeft>
          <View
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              backgroundColor: isEnabled ? "#3b82f6" : "#ccc",
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
