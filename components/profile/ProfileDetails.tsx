import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Container,
  ScrollContainer,
} from "./styles";
import {
  ProfileEditableInputProps,
  ProfileDetailsProps,
  ProfileInfoRowProps,
  UserIdentityField,
  UserProfileEditableValues,
} from "@/types/user";
import {
  formatUserDate,
  formatUserDateTime,
  getUserEditableValues,
  getUserIdentityFields,
  hasUserValue,
  toUserText,
} from "@/utils/user";
import { getBottomTabContentPadding } from "@/utils/bottomTab";

export default function ProfileDetails({
  onBack,
  user,
  onSave,
  saving,
  onRefresh,
  refreshing,
}: ProfileDetailsProps) {
  const insets = useSafeAreaInsets();
  const contentBottomPadding = getBottomTabContentPadding(insets.bottom);
  const identity = user?.identity;
  const isVerified = Boolean(identity?.isVerified ?? user?.isVerified);
  const [isEditing, setIsEditing] = useState(false);
  const [isIdentityVisible, setIsIdentityVisible] = useState(false);
  const [values, setValues] = useState<UserProfileEditableValues>(() => getUserEditableValues(user));

  useEffect(() => {
    setValues(getUserEditableValues(user));
    setIsEditing(false);
    setIsIdentityVisible(false);
  }, [user]);

  const identityFields: UserIdentityField[] = getUserIdentityFields(user);

  const hasIdentityInfo = identityFields.some(({ value }) => hasUserValue(value));

  const handleChange = (field: keyof UserProfileEditableValues) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
  };

  const handleCancel = () => {
    setValues(getUserEditableValues(user));
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    await onSave(values);
    setIsEditing(false);
  };

  const InfoRow = ({ label, value }: ProfileInfoRowProps) => {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    );
  };

  const EditableInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
  }: ProfileEditableInputProps) => {
    return (
      <View style={styles.inputWrapper}>
        <Text style={styles.rowLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
        />
      </View>
    );
  };


  return (
    <Container>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollContainer
          contentContainerStyle={[
            styles.content,
            { paddingBottom: contentBottomPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563eb"
              colors={["#2563eb"]}
            />
          }
        >
          <Text style={styles.pageSubtitle}>
            Quản lý thông tin cá nhân và xác minh danh tính
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
              {!isEditing ? (
                <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                </Pressable>
              ) : null}
            </View>

            {isEditing ? (
              <>
                <EditableInput
                  label="Họ và tên"
                  value={values.fullName}
                  onChangeText={handleChange("fullName")}
                  placeholder="Nhập họ và tên"
                />
                <EditableInput
                  label="Số điện thoại"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
                <EditableInput
                  label="Liên hệ khẩn cấp"
                  value={values.emergencyContactName}
                  onChangeText={handleChange("emergencyContactName")}
                  placeholder="Tên người liên hệ"
                />
                <EditableInput
                  label="SĐT liên hệ khẩn cấp"
                  value={values.emergencyContactPhone}
                  onChangeText={handleChange("emergencyContactPhone")}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
                <InfoRow label="Email" value={toUserText(user?.email)} />
                <InfoRow label="Ngày sinh" value={formatUserDate(user?.dateOfBirth)} />

                <View style={styles.actionsRow}>
                  <Pressable style={styles.cancelButton} onPress={handleCancel} disabled={saving}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <InfoRow label="Họ và tên" value={toUserText(user?.fullName)} />
                <InfoRow label="Email" value={toUserText(user?.email)} />
                <InfoRow label="Số điện thoại" value={toUserText(user?.phone)} />
                <InfoRow label="Ngày sinh" value={formatUserDate(user?.dateOfBirth)} />
                <InfoRow
                  label="Liên hệ khẩn cấp"
                  value={toUserText(user?.emergencyContactName)}
                />
                <InfoRow
                  label="SĐT liên hệ khẩn cấp"
                  value={toUserText(user?.emergencyContactPhone)}
                />
              </>
            )}
          </View>

          <View style={styles.verifyCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Xác minh CCCD/CMND</Text>
              <Text style={styles.verifySubtitle}>
                Trạng thái xác minh danh tính tài khoản
              </Text>
            </View>
            <View style={styles.verifyActions}>
              <Pressable
                style={styles.eyeButton}
                onPress={() => setIsIdentityVisible((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={isIdentityVisible ? "Ẩn thông tin CCCD" : "Hiện thông tin CCCD"}
              >
                <Ionicons
                  name={isIdentityVisible ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#334155"
                />
              </Pressable>
              <View
                style={[
                  styles.verifyBadge,
                  isVerified ? styles.verifyBadgeSuccess : styles.verifyBadgePending,
                ]}
              >
                <Text
                  style={[
                    styles.verifyBadgeText,
                    isVerified
                      ? styles.verifyBadgeTextSuccess
                      : styles.verifyBadgeTextPending,
                  ]}
                >
                  {isVerified ? "Đã xác minh" : "Chưa xác minh"}
                </Text>
              </View>
            </View>
          </View>

          {hasIdentityInfo && isIdentityVisible ? (
            <View style={styles.identityCard}>
              <Text style={styles.cardTitle}>Thông tin định danh</Text>
              {identityFields.map(({ key, label, value }) => {
                if (!hasUserValue(value)) {
                  return null;
                }

                return <InfoRow key={key} label={label} value={toUserText(value)} />;
              })}

              {hasUserValue(identity?.verifiedAt) ? (
                <InfoRow
                  label="Thời gian xác minh"
                  value={formatUserDateTime(identity?.verifiedAt)}
                />
              ) : null}
            </View>
          ) : null}
        </ScrollContainer>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 10,
  },
  identityCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 12,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 10,
    gap: 4,
  },
  rowLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  inputWrapper: {
    gap: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "400",
  },
  actionsRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#2563eb",
    minWidth: 120,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  verifyCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verifyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  verifySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  verifyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  verifyBadgeSuccess: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  verifyBadgePending: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  verifyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  verifyBadgeTextSuccess: {
    color: "#166534",
  },
  verifyBadgeTextPending: {
    color: "#4b5563",
  },
});
