import React from "react";
import { Ionicons } from "@expo/vector-icons";
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
}

export default function ProfileHeader({
  name,
  email,
  avatar,
}: ProfileHeaderProps) {
  return (
    <ProfileHeaderStyled>
      <Avatar>
        {avatar ? (
          <AvatarImage source={{ uri: avatar }} />
        ) : (
          <Ionicons name="person" size={50} color="#3b82f6" />
        )}
      </Avatar>
      <UserName>{name}</UserName>
      <UserEmail>{email}</UserEmail>
    </ProfileHeaderStyled>
  );
}
