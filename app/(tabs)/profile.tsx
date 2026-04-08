import React, { useState } from "react";
import { Alert, Text } from "react-native";
import {
  Container,
  ScrollContainer,
  ProfileHeader,
  ProfileMenu,
  ProfileDetails,
  PushNotifications,
} from "../../components/profile";

interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  screen: string;
}

const menuItems: MenuItemData[] = [
  {
    id: "profile-details",
    label: "Profile details",
    icon: "person",
    screen: "profile-details",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    screen: "settings",
  },
  {
    id: "push-notifications",
    label: "Push Notifications",
    icon: "notifications",
    screen: "push-notifications",
  },
  {
    id: "support",
    label: "Support",
    icon: "help-circle",
    screen: "support",
  },
  {
    id: "logout",
    label: "Logout",
    icon: "log-out",
    screen: "logout",
  },
];

export default function ProfileScreenPage() {
  const [currentScreen, setCurrentScreen] = useState<string>("main");
  const [avatar, setAvatar] = useState<string | null>(null);

  const userData = {
    name: "Ruben Geldt",
    email: "ruben.geldt@example.com",
  };

  const handleAvatarChange = (uri: string) => {
    setAvatar(uri);
  };

  const handleMenuPress = (screen: string) => {
    if (screen === "logout") {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", onPress: () => {} },
        { text: "Logout", onPress: () => {}, style: "destructive" },
      ]);
    } else {
      setCurrentScreen(screen);
    }
  };

  if (currentScreen === "profile-details") {
    return <ProfileDetails onBack={() => setCurrentScreen("main")} />;
  }

  if (currentScreen === "push-notifications") {
    return <PushNotifications onBack={() => setCurrentScreen("main")} />;
  }

  return (
    <Container>
      <Text
        style={{
          padding: 20,
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#1f2937",
        }}
      >
        Profile
      </Text>
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={userData.name}
          email={userData.email}
          avatar={avatar}
          onAvatarChange={handleAvatarChange}
        />
        <ProfileMenu items={menuItems} onMenuPress={handleMenuPress} />
      </ScrollContainer>
    </Container>
  );
}
