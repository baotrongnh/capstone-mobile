import React, { useState } from "react";
import { Alert, BackHandler, RefreshControl, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Container,
  ScrollContainer,
  ProfileHeader,
  ProfileMenu,
  ProfileDetails,
  PushNotifications,
} from "../../components/profile";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateUser, useUpdateUserAvatar } from "@/hooks/query/useUser";
import { uploadImageFromUri } from "@/utils/uploadFile";
import { MenuItemData, UserProfileEditableValues } from "@/types/user";
import { getBottomTabContentPadding } from "@/utils/bottomTab";
import { toUserText } from "@/utils/user";
import { userService } from "@/lib/services/user.service";
import { useQueryClient } from "@tanstack/react-query";

const menuItems: MenuItemData[] = [
  {
    id: "profile-details",
    label: "Thông tin tài khoản",
    icon: "person",
    screen: "profile-details",
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: "settings",
    screen: "settings",
  },
  {
    id: "push-notifications",
    label: "Thông báo đẩy",
    icon: "notifications",
    screen: "push-notifications",
  },
  {
    id: "support",
    label: "Hỗ trợ",
    icon: "help-circle",
    screen: "support",
  },
  {
    id: "logout",
    label: "Đăng xuất",
    icon: "log-out",
    screen: "logout",
  },
];

export default function ProfileScreenPage() {
  const insets = useSafeAreaInsets();
  const contentBottomPadding = getBottomTabContentPadding(insets.bottom);
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { mutateAsync: updateUser, isPending: isUpdatingProfile } = useUpdateUser(user?.id ?? "");
  const { mutateAsync: updateUserAvatar } = useUpdateUserAvatar(user?.id ?? "");

  const [currentScreen, setCurrentScreen] = useState<string>("main");
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  React.useEffect(() => {
    const onBackPress = () => {
      if (currentScreen !== "main") {
        setCurrentScreen("main");
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  const avatarFromStore =
    typeof user?.profileImageUrl === "string" && user.profileImageUrl.trim().length > 0
      ? user.profileImageUrl
      : null;
  const avatar = localAvatar ?? avatarFromStore;

  const handleAvatarChange = async (uri: string) => {
    if (!user?.id) {
      Alert.alert("Thiếu thông tin", "Không tìm thấy tài khoản người dùng để cập nhật ảnh đại diện.");
      return;
    }

    setLocalAvatar(uri);

    try {
      setAvatarUploading(true);
      const uploaded = await uploadImageFromUri(uri);
      await updateUserAvatar(uploaded.url);
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
    } catch (error) {
      console.error("Avatar update failed", error);
      setLocalAvatar(avatarFromStore);
      Alert.alert("Cập nhật thất bại", "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (values: UserProfileEditableValues) => {
    if (!user?.id) {
      Alert.alert("Thiếu thông tin", "Không tìm thấy tài khoản người dùng để cập nhật.");
      return;
    }

    try {
      await updateUser({
        fullName: values.fullName,
        phone: values.phone,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
      });
      Alert.alert("Thành công", "Đã cập nhật thông tin tài khoản.");
    } catch (error) {
      console.error("Profile update failed", error);
      Alert.alert("Cập nhật thất bại", "Không thể cập nhật thông tin. Vui lòng thử lại.");
      throw error;
    }
  };

  const handleMenuPress = (screen: string) => {
    if (screen === "logout") {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
        { text: "Hủy", onPress: () => { } },
        {
          text: "Đăng xuất",
          onPress: () => {
            void logout();
          },
          style: "destructive",
        },
      ]);
    } else if (screen === "settings" || screen === "support") {
      Alert.alert("Thông báo", "Tính năng này sẽ được cập nhật sớm.");
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleRefreshProfile = async () => {
    if (refreshingProfile || !isHydrated || !isAuthenticated || !tokens) {
      return;
    }

    try {
      setRefreshingProfile(true);
      await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });

      const refreshedUser = await queryClient.fetchQuery({
        queryKey: ["user", "profile"],
        queryFn: () => userService.getProfile(),
      });

      await setAuth(refreshedUser, tokens);
    } catch (error) {
      console.error("Profile refresh failed", error);
      Alert.alert("Làm mới thất bại", "Không thể tải lại thông tin tài khoản. Vui lòng thử lại.");
    } finally {
      setRefreshingProfile(false);
    }
  };

  if (!isHydrated) {
    return (
      <Container>
        <Text
          style={{
            padding: 20,
            fontSize: 16,
            color: "#6b7280",
          }}
        >
          Đang tải thông tin tài khoản...
        </Text>
      </Container>
    );
  }

  if (currentScreen === "profile-details") {
    return (
      <ProfileDetails
        onBack={() => setCurrentScreen("main")}
        user={user}
        onSave={handleSaveProfile}
        saving={isUpdatingProfile}
        onRefresh={handleRefreshProfile}
        refreshing={refreshingProfile}
      />
    );
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
        Cá nhân
      </Text>
      <ScrollContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentBottomPadding }}
        refreshControl={
          <RefreshControl
            refreshing={refreshingProfile}
            onRefresh={handleRefreshProfile}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
      >
        <ProfileHeader
          name={toUserText(user?.fullName)}
          email={toUserText(user?.email)}
          avatar={avatar}
          isVerified={Boolean(user?.identity?.isVerified ?? user?.isVerified)}
          avatarUploading={avatarUploading}
          onAvatarChange={handleAvatarChange}
        />
        <ProfileMenu items={menuItems} onMenuPress={handleMenuPress} />
      </ScrollContainer>
    </Container>
  );
}
