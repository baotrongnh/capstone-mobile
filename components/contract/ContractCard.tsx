import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ContractWithMembers,
  CONTRACT_STATUS_MAP,
  ContractStatus,
} from "@/types/contract";
import { router } from "expo-router";

interface ContractCardProps {
  contract: ContractWithMembers;
  onViewPress: () => void;
  onCancelPress: () => void;
  onExtendPress: () => void;
  onDownloadPress: () => void;
  onAddMemberPress: () => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  contractHead: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contractNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 8,
  },
  fullWidthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  twoColumnItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  priceSection: {
    marginTop: 2,
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  notificationBox: {
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  notificationBlue: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  notificationGreen: {
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  notificationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTextBlue: {
    color: "#1e3a8a",
  },
  notificationTextGreen: {
    color: "#166534",
  },

  /* ====== CSS MODAL TRƯỢT TỪ DƯỚI LÊN ====== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Nền mờ phía sau
    justifyContent: "flex-end", // Đẩy nội dung xuống đáy màn hình
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20, // Bo tròn 2 góc trên
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24, // Padding thêm ở đáy cho thiết bị có tai thỏ/home indicator
    width: "100%", // Trải dài hết chiều ngang
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  // Thanh gạt nhỏ ở trên cùng của modal (Tùy chọn, giúp UI giống Bottom Sheet chuẩn hơn)
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16, // Tăng padding lên một chút để dễ bấm trên điện thoại
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16, // Tăng size chữ lên một chút cho phù hợp với bottom sheet
    color: "#374151",
    fontWeight: "500",
  },
  menuItemDangerText: {
    color: "#ef4444",
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },
});

const getStatusStyle = (status: ContractStatus) => {
  const statusConfig = CONTRACT_STATUS_MAP[status];
  if (!statusConfig) return { backgroundColor: "#ef4444" };
  return { backgroundColor: statusConfig.color };
};

export const ContractCard = ({
  contract,
  onViewPress,
  onCancelPress,
  onExtendPress,
  onDownloadPress,
  onAddMemberPress,
}: ContractCardProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const primaryTenant = contract.members?.find(
    (m) => m.memberType === "primary",
  );
  const statusConfig =
    CONTRACT_STATUS_MAP[contract.status as ContractStatus] ||
    CONTRACT_STATUS_MAP.terminated;
  const startDate = new Date(contract.startDate).toLocaleDateString("vi-VN");
  const endDate = new Date(contract.endDate).toLocaleDateString("vi-VN");
  const monthlyRent = Number(contract.monthlyRent).toLocaleString("vi-VN");

  const handleMenuAction = (action: () => void) => {
    setMenuVisible(false);
    setTimeout(action, 300); // Chờ animation slide down hoàn tất rồi mới chạy action
  };

  return (
    <>
      <View style={styles.card}>
        {/* Header with Contract Number & 3-dot Menu */}
        <View style={styles.headerRow}>
          <View style={styles.contractHead}>
            <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                getStatusStyle(contract.status as ContractStatus),
              ]}
            >
              <Text style={styles.statusText}>{statusConfig.label}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.menuButton,
              pressed && { backgroundColor: "#f1f5f9" },
            ]}
            onPress={() => setMenuVisible(true)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              color="#64748b"
              size={24}
            />
          </Pressable>
        </View>

        {/* Info Section (Giữ nguyên) */}
        <View style={styles.section}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Giá thuê/tháng</Text>
            <Text style={styles.priceValue}>{monthlyRent} đ</Text>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <Text style={styles.label}>Thời hạn</Text>
              <Text style={styles.value}>
                {startDate} - {endDate}
              </Text>
            </View>
            <View style={styles.twoColumnItem}>
              <Text style={styles.label}>Căn hộ</Text>
              <Text style={styles.value}>
                Phòng {contract.apartment?.apartmentNumber || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <Text style={styles.label}>Người thuê</Text>
              <Text style={styles.value}>
                {primaryTenant?.user?.fullName || "N/A"}
              </Text>
            </View>
            <View style={styles.twoColumnItem}>
              <Text style={styles.label}>Thành viên</Text>
              <Text style={styles.value}>
                {contract.members?.length || 0} người
              </Text>
            </View>
          </View>

          <View style={styles.fullWidthRow}>
            <View style={styles.content}>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>
                {contract.apartment?.streetAddress || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications (Giữ nguyên) */}
        {contract.status === "signed" && (
          <View style={[styles.notificationBox, styles.notificationBlue]}>
            <MaterialCommunityIcons
              name="information"
              color="#2563eb"
              size={18}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.notificationText, styles.notificationTextBlue]}
              >
                Hợp đồng đã ký.{" "}
                <Text
                  onPress={() => router.push("/invoices")}
                  style={{ textDecorationLine: "underline", fontWeight: "600" }}
                >
                  Vui lòng thanh toán!
                </Text>
              </Text>
            </View>
          </View>
        )}

        {contract.status === "active" && (
          <View style={[styles.notificationBox, styles.notificationGreen]}>
            <MaterialCommunityIcons
              name="check-circle"
              color="#16a34a"
              size={18}
            />
            <Text
              style={[styles.notificationText, styles.notificationTextGreen]}
            >
              Hợp đồng đã được kích hoạt. Thanh toán định kỳ sẽ được yêu cầu
            </Text>
          </View>
        )}
      </View>

      {/* ===== ACTION MODAL (HIỆU ỨNG SLIDE TỪ DƯỚI LÊN) ===== */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide" // Chuyển sang hiệu ứng trượt
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Thanh gạt trang trí phía trên cùng */}
                <View style={styles.dragHandle} />

                {/* Nút Xem & Ký */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: "#f9fafb" },
                  ]}
                  onPress={() => handleMenuAction(onViewPress)}
                >
                  <MaterialCommunityIcons
                    name="eye-outline"
                    color="#4b5563"
                    size={24}
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>
                    {contract.status === "draft"
                      ? "Xem & ký hợp đồng"
                      : "Xem hợp đồng"}
                  </Text>
                </Pressable>

                {/* Nút Tải hợp đồng */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: "#f9fafb" },
                  ]}
                  onPress={() => handleMenuAction(onDownloadPress)}
                >
                  <MaterialCommunityIcons
                    name="download-outline"
                    color="#4b5563"
                    size={24}
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>Tải hợp đồng</Text>
                </Pressable>

                {/* Nút Thêm thành viên */}
                {contract.status === "draft" && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && { backgroundColor: "#f9fafb" },
                    ]}
                    onPress={() => handleMenuAction(onAddMemberPress)}
                  >
                    <MaterialCommunityIcons
                      name="account-outline"
                      color="#4b5563"
                      size={24}
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuItemText}>Thêm thành viên</Text>
                  </Pressable>
                )}

                {/* Nút Gia hạn */}
                {contract.status === "active" && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && { backgroundColor: "#f9fafb" },
                    ]}
                    onPress={() => handleMenuAction(onExtendPress)}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      color="#4b5563"
                      size={24}
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuItemText}>Gia hạn hợp đồng</Text>
                  </Pressable>
                )}

                {/* Nút Hủy */}
                {contract.status !== "terminated" &&
                  contract.status !== "active" && (
                    <>
                      <View style={styles.separator} />
                      <Pressable
                        style={({ pressed }) => [
                          styles.menuItem,
                          pressed && { backgroundColor: "#fef2f2" },
                        ]}
                        onPress={() => handleMenuAction(onCancelPress)}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          color="#ef4444"
                          size={24}
                          style={styles.menuIcon}
                        />
                        <Text
                          style={[
                            styles.menuItemText,
                            styles.menuItemDangerText,
                          ]}
                        >
                          Hủy hợp đồng
                        </Text>
                      </Pressable>
                    </>
                  )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
