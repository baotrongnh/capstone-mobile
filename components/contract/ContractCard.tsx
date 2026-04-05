import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ContractWithMembers,
  CONTRACT_STATUS_MAP,
  ContractStatus,
} from "@/types/contract";

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
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#efefef",
  },
  contractNumberLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contractNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#999",
    marginBottom: 3,
    fontWeight: "600",
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 18,
  },
  priceSection: {
    backgroundColor: "#f5f9ff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0edf9",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2196f3",
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2196f3",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  successButton: {
    backgroundColor: "#4caf50",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  warningButton: {
    backgroundColor: "#ffc107",
  },
  warningButtonText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "700",
  },
  notificationBox: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  notificationBlue: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  notificationGreen: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  notificationText: {
    flex: 1,
    fontSize: 12,
  },
  notificationTextBlue: {
    color: "#1565c0",
  },
  notificationTextGreen: {
    color: "#2e7d32",
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
  const primaryTenant = contract.members?.find(
    (m) => m.memberType === "primary",
  );
  const statusConfig =
    CONTRACT_STATUS_MAP[contract.status as ContractStatus] ||
    CONTRACT_STATUS_MAP.terminated;
  const startDate = new Date(contract.startDate).toLocaleDateString("vi-VN");
  const endDate = new Date(contract.endDate).toLocaleDateString("vi-VN");
  const monthlyRent = Number(contract.monthlyRent).toLocaleString("vi-VN");

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.contractNumberLabel}>Mã hợp đồng</Text>
          <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            getStatusStyle(contract.status as ContractStatus),
          ]}
        >
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
      </View>

      {/* Tenant Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account-outline"
              color="#888"
              size={18}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Người thuê</Text>
            <Text style={styles.value}>
              {primaryTenant?.user?.fullName || "N/A"}
            </Text>
          </View>
        </View>

        {/* Apartment Info */}
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="office-building-outline"
              color="#888"
              size={18}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Căn hộ</Text>
            <Text style={styles.value}>
              Phòng {contract.apartment?.apartmentNumber}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              color="#888"
              size={18}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={styles.value}>{contract.apartment?.address}</Text>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="calendar-outline"
              color="#888"
              size={18}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Thời hạn</Text>
            <Text style={styles.value}>
              {startDate} - {endDate}
            </Text>
          </View>
        </View>

        {/* Members Count */}
        {contract.members && contract.members.length > 0 && (
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="account-multiple-outline"
                color="#888"
                size={18}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.label}>Số thành viên</Text>
              <Text style={styles.value}>{contract.members.length} người</Text>
            </View>
          </View>
        )}
      </View>

      {/* Notifications */}
      {contract.status === "signed" && (
        <View style={[styles.notificationBox, styles.notificationBlue]}>
          <MaterialCommunityIcons
            name="information"
            color="#1976d2"
            size={16}
          />
          <Text style={[styles.notificationText, styles.notificationTextBlue]}>
            Hợp đồng đã ký. Vui lòng chờ xác nhận kích hoạt
          </Text>
        </View>
      )}

      {contract.status === "active" && (
        <View style={[styles.notificationBox, styles.notificationGreen]}>
          <MaterialCommunityIcons
            name="check-circle"
            color="#388e3c"
            size={16}
          />
          <Text style={[styles.notificationText, styles.notificationTextGreen]}>
            Hợp đồng đã được kích hoạt. Thanh toán định kỳ sẽ được yêu cầu
          </Text>
        </View>
      )}

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Giá thuê/tháng</Text>
        <Text style={styles.priceValue}>{monthlyRent} đ</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={onViewPress}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            color="#fff"
            size={16}
          />
          <Text style={styles.primaryButtonText}>
            {contract.status === "draft" ? "Xem & Ký" : "Xem hợp đồng"}
          </Text>
        </Pressable>

        {contract.status !== "terminated" && contract.status !== "signed" && (
          <Pressable
            style={[styles.button, styles.dangerButton]}
            onPress={onCancelPress}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              color="#fff"
              size={16}
            />
            <Text style={styles.dangerButtonText}>Hủy hợp đồng</Text>
          </Pressable>
        )}

        {contract.status === "active" && (
          <Pressable
            style={[styles.button, styles.successButton]}
            onPress={onExtendPress}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              color="#fff"
              size={16}
            />
            <Text style={styles.successButtonText}>Gia hạn hợp đồng</Text>
          </Pressable>
        )}

        {contract.status === "draft" && (
          <Pressable
            style={[styles.button, styles.warningButton]}
            onPress={onAddMemberPress}
          >
            <MaterialCommunityIcons
              name="account-plus-outline"
              color="#333"
              size={16}
            />
            <Text style={styles.warningButtonText}>Thêm thành viên</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={onDownloadPress}
        >
          <MaterialCommunityIcons
            name="download-outline"
            color="#333"
            size={16}
          />
          <Text style={styles.secondaryButtonText}>Tải hợp đồng</Text>
        </Pressable>
      </View>
    </View>
  );
};
