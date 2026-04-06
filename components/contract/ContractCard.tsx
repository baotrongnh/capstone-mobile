import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  contractNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  menuButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 10,
  },
  fullWidthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  twoColumnItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 1,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#999",
    marginBottom: 2,
    fontWeight: "600",
  },
  value: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  priceSection: {
    backgroundColor: "#f5f9ff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0edf9",
  },
  priceLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2196f3",
  },
  notificationBox: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  notificationBlue: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 3,
    borderLeftColor: "#2196f3",
  },
  notificationGreen: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 3,
    borderLeftColor: "#4caf50",
  },
  notificationText: {
    flex: 1,
    fontSize: 10,
  },
  notificationTextBlue: {
    color: "#1565c0",
  },
  notificationTextGreen: {
    color: "#2e7d32",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  modalButtonPrimary: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  modalButtonPrimaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  modalButtonSecondary: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
  },
  modalButtonSecondaryText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  modalButtonDanger: {
    backgroundColor: "#f44336",
    borderColor: "#f44336",
  },
  modalButtonDangerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  modalButtonSuccess: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  modalButtonSuccessText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  modalButtonWarning: {
    backgroundColor: "#ffc107",
    borderColor: "#ffc107",
  },
  modalButtonWarningText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

const getStatusStyle = (status: ContractStatus) => {
  const statusConfig = CONTRACT_STATUS_MAP[status];
  if (!statusConfig) return { backgroundColor: "#f44336" };
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
    setTimeout(action, 200);
  };

  console.log("first", contract);

  return (
    <>
      <View style={styles.card}>
        {/* Header with Contract Number & 3-dot Menu */}
        <View style={styles.headerRow}>
          <View>
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
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              color="#666"
              size={22}
            />
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          {/* Tenant Info - Full Width */}

          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="account-outline"
                  color="#888"
                  size={16}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Người thuê</Text>
                <Text style={styles.value}>
                  {primaryTenant?.user?.fullName || "N/A"}
                </Text>
              </View>
            </View>
            {contract.members && contract.members.length > 0 && (
              <View style={styles.twoColumnItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    color="#888"
                    size={16}
                  />
                </View>
                <View style={styles.content}>
                  <Text style={styles.label}>Số tiền đặt cọc</Text>
                  <Text style={styles.value}>
                    {Number(contract?.depositAmount).toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Apartment & Members - Two Columns */}
          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="office-building-outline"
                  color="#888"
                  size={16}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Căn hộ</Text>
                <Text style={styles.value}>
                  Phòng {contract.apartment?.apartmentNumber}
                </Text>
              </View>
            </View>

            {contract.members && contract.members.length > 0 && (
              <View style={styles.twoColumnItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    color="#888"
                    size={16}
                  />
                </View>
                <View style={styles.content}>
                  <Text style={styles.label}>Thành viên</Text>
                  <Text style={styles.value}>
                    {contract.members.length} người
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Address - Full Width */}
          <View style={styles.fullWidthRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                color="#888"
                size={16}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>
                {contract.apartment?.streetAddress}
              </Text>
            </View>
          </View>

          {/* Date Range - Full Width */}
          <View style={styles.fullWidthRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="calendar-outline"
                color="#888"
                size={16}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.label}>Thời hạn</Text>
              <Text style={styles.value}>
                {startDate} - {endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        {contract.status === "signed" && (
          <View style={[styles.notificationBox, styles.notificationBlue]}>
            <MaterialCommunityIcons
              name="information"
              color="#1976d2"
              size={14}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.notificationText, styles.notificationTextBlue]}
              >
                Hợp đồng đã ký.{" "}
                <Text
                  onPress={() => router.push("/")}
                  style={{ textDecorationLine: "underline" }}
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
              color="#388e3c"
              size={14}
            />
            <Text
              style={[styles.notificationText, styles.notificationTextGreen]}
            >
              Hợp đồng đã được kích hoạt. Thanh toán định kỳ sẽ được yêu cầu
            </Text>
          </View>
        )}

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Giá thuê/tháng</Text>
          <Text style={styles.priceValue}>{monthlyRent} đ</Text>
        </View>
      </View>

      {/* Action Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>
                  {contract.contractNumber}
                </Text>

                <Pressable
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => handleMenuAction(onViewPress)}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    color="#fff"
                    size={20}
                  />
                  <Text style={styles.modalButtonPrimaryText}>
                    {contract.status === "draft" ? "Xem & Ký" : "Xem hợp đồng"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => handleMenuAction(onDownloadPress)}
                >
                  <MaterialCommunityIcons
                    name="download-outline"
                    color="#333"
                    size={20}
                  />
                  <Text style={styles.modalButtonSecondaryText}>
                    Tải hợp đồng
                  </Text>
                </Pressable>

                {contract.status === "draft" && (
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonWarning]}
                    onPress={() => handleMenuAction(onAddMemberPress)}
                  >
                    <MaterialCommunityIcons
                      name="account-plus-outline"
                      color="#333"
                      size={20}
                    />
                    <Text style={styles.modalButtonWarningText}>
                      Thêm thành viên
                    </Text>
                  </Pressable>
                )}

                {contract.status === "active" && (
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonSuccess]}
                    onPress={() => handleMenuAction(onExtendPress)}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      color="#fff"
                      size={20}
                    />
                    <Text style={styles.modalButtonSuccessText}>
                      Gia hạn hợp đồng
                    </Text>
                  </Pressable>
                )}

                {contract.status !== "terminated" &&
                  contract.status !== "active" && (
                    <Pressable
                      style={[styles.modalButton, styles.modalButtonDanger]}
                      onPress={() => handleMenuAction(onCancelPress)}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        color="#fff"
                        size={20}
                      />
                      <Text style={styles.modalButtonDangerText}>
                        Hủy hợp đồng
                      </Text>
                    </Pressable>
                  )}

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
