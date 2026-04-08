import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Alert, View, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ProfileHeaderStyled,
  Avatar,
  AvatarImage,
  UserName,
  UserEmail,
} from "./styles";
import { ProfileHeaderProps } from "@/types/user";

export default function ProfileHeader({
  name,
  email,
  avatar,
  isVerified = false,
  avatarUploading = false,
  onAvatarChange,
}: ProfileHeaderProps) {
  const handleAvatarPress = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh để cập nhật ảnh đại diện.",
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
        await onAvatarChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Có lỗi xảy ra", "Không thể chọn ảnh đại diện.");
    }
  };

  return (
    <ProfileHeaderStyled>
      <Pressable onPress={handleAvatarPress} disabled={avatarUploading}>
        <Avatar>
          {avatar ? (
            <AvatarImage source={{ uri: avatar }} />
          ) : (
            <Ionicons name="person" size={50} color="#6b7280" />
          )}
          {avatarUploading ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 50,
                backgroundColor: "rgba(0,0,0,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : null}
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
      <View
        style={{
          marginTop: -8,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: isVerified ? "#dcfce7" : "#f3f4f6",
          borderWidth: 1,
          borderColor: isVerified ? "#86efac" : "#d1d5db",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isVerified ? "#166534" : "#4b5563",
          }}
        >
          {isVerified ? "Đã xác minh" : "Chưa xác minh"}
        </Text>
      </View>
    </ProfileHeaderStyled>
  );
}
