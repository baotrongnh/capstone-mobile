import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Alert, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ProfileHeaderStyled,
  Avatar,
  AvatarImage,
  UserName,
  UserEmail,
} from "./styles";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: string | null;
  onAvatarChange?: (uri: string) => void;
}

export default function ProfileHeader({
  name,
  email,
  avatar,
  onAvatarChange,
}: ProfileHeaderProps) {
  const handleAvatarPress = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please grant permission to access your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && onAvatarChange) {
        onAvatarChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <ProfileHeaderStyled>
      <Pressable onPress={handleAvatarPress}>
        <Avatar>
          {avatar ? (
            <AvatarImage source={{ uri: avatar }} />
          ) : (
            <Ionicons name="person" size={50} color="#6b7280" />
          )}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#3b82f6",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 3,
              borderColor: "#ffffff",
            }}
          >
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </View>
        </Avatar>
      </Pressable>
      <UserName>{name}</UserName>
      <UserEmail>{email}</UserEmail>
    </ProfileHeaderStyled>
  );
}
