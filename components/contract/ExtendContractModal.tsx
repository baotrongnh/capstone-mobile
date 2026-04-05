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
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ContractWithMembers } from "@/types/contract";
import { useRenewContract } from "@/hooks/query/useContracts";
import { Picker } from "@react-native-picker/picker";

interface ExtendContractModalProps {
  visible: boolean;
  contract: ContractWithMembers | null;
  onClose: () => void;
}

const monthOptions = [
  { label: "1 tháng", value: 1 },
  { label: "2 tháng", value: 2 },
  { label: "3 tháng", value: 3 },
  { label: "4 tháng", value: 4 },
  { label: "5 tháng", value: 5 },
  { label: "6 tháng", value: 6 },
  { label: "7 tháng", value: 7 },
  { label: "8 tháng", value: 8 },
  { label: "9 tháng", value: 9 },
  { label: "10 tháng", value: 10 },
  { label: "11 tháng", value: 11 },
  { label: "12 tháng", value: 12 },
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
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
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
    backgroundColor: "#2196f3",
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
  infoBoxBlue: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  infoTextBlue: {
    color: "#1976d2",
  },
});

export const ExtendContractModal = ({
  visible,
  contract,
  onClose,
}: ExtendContractModalProps) => {
  const { mutateAsync: renewContract, isPending } = useRenewContract(
    contract?.id || "",
  );
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [specialConditions, setSpecialConditions] = useState("");

  const handleExtend = async () => {
    if (!selectedMonths) {
      Alert.alert("Thông báo", "Vui lòng chọn số tháng gia hạn");
      return;
    }

    if (!contract?.id) return;

    try {
      const payload = {
        extensionMonths: selectedMonths,
        specialConditions: specialConditions || "",
        additionalMembers: [],
      };
      await renewContract(payload);
      setSelectedMonths(null);
      setSpecialConditions("");
      onClose();
    } catch (error) {
      console.error("Error extending contract:", error);
    }
  };

  if (!contract) return null;

  const calculateNewEndDate = () => {
    if (!selectedMonths) return null;
    const currentEndDate = new Date(contract.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + selectedMonths);
    return newEndDate;
  };

  const newEndDate = calculateNewEndDate();

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
              <Text style={styles.headerTitle}>Gia hạn hợp đồng</Text>
              <Text style={styles.headerSubtitle}>
                {contract.contractNumber}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" color="#666" size={20} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Contract Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Thông tin hợp đồng hiện tại
              </Text>
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
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Ngày kết thúc hiện tại</Text>
                <Text style={styles.infoValue}>
                  {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            {/* Extension Period Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng gia hạn</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedMonths}
                  onValueChange={(itemValue) => setSelectedMonths(itemValue)}
                  mode="dialog"
                >
                  <Picker.Item label="Chọn số tháng gia hạn..." value={null} />
                  {monthOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* New End Date Preview */}
            {newEndDate && (
              <View style={styles.section}>
                <View style={[styles.infoBox, styles.infoBoxBlue]}>
                  <Text style={[styles.infoLabel, styles.infoTextBlue]}>
                    Ngày kết thúc mới
                  </Text>
                  <Text style={[styles.infoValue, styles.infoTextBlue]}>
                    {newEndDate.toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>
            )}

            {/* Special Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Điều kiện đặc biệt (tùy chọn)
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập các điều kiện đặc biệt nếu có..."
                value={specialConditions}
                onChangeText={setSpecialConditions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Notice */}
            <View style={styles.section}>
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: "#fff3cd",
                    borderLeftWidth: 3,
                    borderLeftColor: "#ff9800",
                  },
                ]}
              >
                <Text style={{ fontSize: 12, color: "#856404" }}>
                  ⚠️ Các bên liên quan sẽ được thông báo ngay khi hợp đồng được
                  gia hạn.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleExtend}
              disabled={isPending || !selectedMonths}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="clock" color="#fff" size={16} />
                  <Text style={styles.primaryButtonText}>
                    Chấp nhận gia hạn
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
