import { PROFILE_MENU_ITEMS } from "@/constants/profile";
import { useUpdateUser, useUpdateUserAvatar } from "@/hooks/query/useUser";
import { userService } from "@/lib/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { UserProfileEditableValues } from "@/types/user";
import { getBottomTabContentPadding } from "@/utils/bottomTab";
import { uploadImageFromUri } from "@/utils/uploadFile";
import { toUserText } from "@/utils/user";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, BackHandler, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Container,
  ProfileDetails,
  ProfileHeader,
  ProfileMenu,
  ScrollContainer,
  Settings
} from "../../components/profile";

const DEBUG_PASSWORD = "290304";

export default function ProfileScreenPage() {
  const router = useRouter();
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
  const [debugPassword, setDebugPassword] = useState("");
  const [showDebugPasswordModal, setShowDebugPasswordModal] = useState(false);

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
    } else if (screen === "support") {
      Alert.alert("Thông báo", "Tính năng này sẽ được cập nhật sớm.");
    } else if (screen === "debug") {
      router.push("/debug");
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleMenuLongPress = (screen: string) => {
    if (screen !== "settings") {
      return;
    }

    setDebugPassword("");
    setShowDebugPasswordModal(true);
  };

  const openDebugScreen = () => {
    if (debugPassword !== DEBUG_PASSWORD) {
      Alert.alert("Sai mật khẩu", "Vui lòng nhập đúng mật khẩu 6 số.");
      return;
    }

    setShowDebugPasswordModal(false);
    setDebugPassword("");
    router.push("/debug");
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


  if (currentScreen === "settings") {
    return <Settings onBack={() => setCurrentScreen("main")} />;
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
        <ProfileMenu
          items={PROFILE_MENU_ITEMS}
          onMenuPress={handleMenuPress}
          onMenuLongPress={handleMenuLongPress}
        />
      </ScrollContainer>

      <Modal
        visible={showDebugPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDebugPasswordModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mở debug thiết bị</Text>
            <Text style={styles.modalText}>Nhập mật khẩu 6 số để tiếp tục.</Text>
            <TextInput
              value={debugPassword}
              onChangeText={(value) => setDebugPassword(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={styles.passwordInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDebugPasswordModal(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={openDebugScreen}>
                <Text style={styles.confirmText}>Vào debug</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalText: {
    color: "#64748b",
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#0f172a",
    fontSize: 18,
    letterSpacing: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "700",
  },
  confirmText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
