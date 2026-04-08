import React from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
  ScrollContainer,
  HeaderBar,
  BackButton,
  TextInputField,
} from "./styles";

interface ProfileDetailsProps {
  onBack: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

export default function ProfileDetails({ onBack }: ProfileDetailsProps) {
  const userData: UserData = {
    firstName: "Ruben",
    lastName: "Geldt",
    dateOfBirth: "24 December, 1992",
    email: "ruben.geldt@example.com",
  };

  return (
    <Container>
      <HeaderBar>
        <BackButton
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={24} color="#6b7280" />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#6d6d6d" }}>
            Tài khoản
          </Text>
        </BackButton>
      </HeaderBar>
      <ScrollContainer style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, color: "#313131", marginBottom: 8 }}>
          Thông tin tài khoản
        </Text>
        <Text style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>
          First name
        </Text>
        <TextInputField placeholder={userData.firstName} editable={false} />

        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            marginBottom: 8,
            marginTop: 20,
          }}
        >
          Last name
        </Text>
        <TextInputField placeholder={userData.lastName} editable={false} />

        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            marginBottom: 8,
            marginTop: 20,
          }}
        >
          Date of birth
        </Text>
        <TextInputField placeholder={userData.dateOfBirth} editable={false} />

        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            marginBottom: 8,
            marginTop: 20,
          }}
        >
          Email
        </Text>
        <TextInputField placeholder={userData.email} editable={false} />
      </ScrollContainer>
    </Container>
  );
}
