import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ContractWithMembers } from "@/types/contract";
import { useCancelContract } from "@/hooks/query/useContracts";
import { Picker } from "@react-native-picker/picker";

interface CancelContractModalProps {
  visible: boolean;
  contract: ContractWithMembers | null;
  onClose: () => void;
}

const reasonOptions = [
  { label: "Người thuê yêu cầu hủy", value: "tenant_request" },
  { label: "Chủ nhà yêu cầu hủy", value: "landlord_request" },
  { label: "Vi phạm điều khoản hợp đồng", value: "violation" },
  { label: "Không thanh toán đầy đủ", value: "non_payment" },
  { label: "Thỏa thuận chung", value: "mutual_agreement" },
  { label: "Lý do khác", value: "other" },
];

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.95,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  warningBox: {
    backgroundColor: "#fff5f0",
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b6b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    flexDirection: "row",
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#c41c3b",
  },
  warningTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#efefef",
  },
  infoLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#efefef",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#f44336",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
});

export const CancelContractModal = ({
  visible,
  contract,
  onClose,
}: CancelContractModalProps) => {
  const { mutateAsync: cancelContract, isPending } = useCancelContract(
    contract?.id || "",
  );
  const [selectedReason, setSelectedReason] = useState("");

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert("Thông báo", "Vui lòng chọn lý do hủy hợp đồng");
      return;
    }

    if (!contract?.id) return;

    try {
      await cancelContract(selectedReason);
      setSelectedReason("");
      onClose();
    } catch (error) {
      console.error("Error canceling contract:", error);
    }
  };

  if (!contract) return null;

  const selectedOption = reasonOptions.find(
    (opt) => opt.value === selectedReason,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Hủy hợp đồng</Text>
              <Text style={styles.headerSubtitle}>
                {contract.contractNumber}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" color="#666" size={20} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Warning Box */}
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-circle"
                color="#ff9800"
                size={20}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningText, styles.warningTitle]}>
                  Thao tác này sẽ hủy hợp đồng
                </Text>
                <Text style={styles.warningText}>
                  Hủy hợp đồng là thao tác quan trọng. Các bên liên quan sẽ được
                  thông báo ngay lập tức.
                </Text>
              </View>
            </View>

            {/* Contract Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Mã hợp đồng</Text>
                <Text style={styles.infoValue}>{contract.contractNumber}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Căn hộ</Text>
                <Text style={styles.infoValue}>
                  Phòng {contract.apartment?.apartmentNumber}
                </Text>
              </View>
            </View>

            {/* Reason Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lý do hủy hợp đồng</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedReason}
                  onValueChange={(itemValue) => setSelectedReason(itemValue)}
                  mode="dialog"
                >
                  <Picker.Item label="Chọn lý do..." value="" />
                  {reasonOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Selected Reason Description */}
            {selectedOption && (
              <View style={styles.section}>
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: "#e3f2fd",
                      borderLeftWidth: 3,
                      borderLeftColor: "#2196f3",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#1976d2",
                      fontWeight: "600",
                    }}
                  >
                    Lý do được chọn:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#1a1a1a",
                      fontWeight: "600",
                      marginTop: 4,
                    }}
                  >
                    {selectedOption.label}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleCancel}
              disabled={isPending || !selectedReason}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="delete"
                    color="#fff"
                    size={16}
                  />
                  <Text style={styles.primaryButtonText}>Xác nhận hủy</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.secondaryButtonText}>Hủy bỏ</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
