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
import { useAddMemberContract } from "@/hooks/query/useContracts";

interface AddMemberModalProps {
  visible: boolean;
  contract: ContractWithMembers | null;
  onClose: () => void;
}

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
  memberCard: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddebf7",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  memberDetail: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#fff5f5",
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
  emptyBox: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
});

export const AddMemberModal = ({
  visible,
  contract,
  onClose,
}: AddMemberModalProps) => {
  const { mutateAsync: addMember, isPending } = useAddMemberContract(
    contract?.id || "",
  );
  const [nationalId, setNationalId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<
    Map<string, { nationalId: string; fullName: string; email: string }>
  >(new Map());

  const handleAddMember = async () => {
    // For now, we'll just store the CCCD and show it
    // In a real app, you would search the user database first
    const cleanedId = nationalId.replace(/\D/g, "");

    if (cleanedId.length !== 12) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 12 số CCCD");
      return;
    }

    if (selectedMembers.has(cleanedId)) {
      Alert.alert("Thông báo", "CCCD này đã được thêm");
      return;
    }

    // Mock data - in real app, fetch from API
    const newMember = {
      nationalId: cleanedId,
      fullName: `Thành viên ${selectedMembers.size + 1}`,
      email: `member${selectedMembers.size + 1}@example.com`,
    };

    const newSelected = new Map(selectedMembers);
    newSelected.set(cleanedId, newMember);
    setSelectedMembers(newSelected);
    setNationalId("");
  };

  const handleConfirm = async () => {
    if (selectedMembers.size === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm ít nhất một thành viên");
      return;
    }

    if (!contract?.id) return;

    try {
      // Add first member (React Native limitation)
      const firstMember = Array.from(selectedMembers.values())[0];
      const payload = {
        nationalId: firstMember.nationalId,
        memberType: "co_tenant",
        isPrimaryContact: false,
        sharePercentage: 0,
      };
      await addMember(payload);
      setSelectedMembers(new Map());
      setNationalId("");
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  if (!contract) return null;

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
              <Text style={styles.headerTitle}>Thêm thành viên</Text>
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
              <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Mã hợp đồng</Text>
                <Text style={styles.infoValue}>{contract.contractNumber}</Text>
              </View>
            </View>

            {/* CCCD Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tìm kiếm thành viên</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập 12 số CCCD"
                value={nationalId}
                onChangeText={(text) =>
                  setNationalId(text.replace(/\D/g, "").slice(0, 12))
                }
                keyboardType="number-pad"
                maxLength={12}
              />
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  nationalId.length !== 12 && { opacity: 0.5 },
                ]}
                onPress={handleAddMember}
                disabled={nationalId.length !== 12}
              >
                <MaterialCommunityIcons name="plus" color="#fff" size={16} />
                <Text style={styles.primaryButtonText}>Thêm thành viên</Text>
              </Pressable>
            </View>

            {/* Selected Members */}
            {selectedMembers.size > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thành viên đã chọn</Text>
                {Array.from(selectedMembers.values()).map((member) => (
                  <View key={member.nationalId} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.fullName}</Text>
                      <Text style={styles.memberDetail}>
                        CCCD: {member.nationalId}
                      </Text>
                      <Text style={styles.memberDetail}>
                        Email: {member.email}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => {
                        const next = new Map(selectedMembers);
                        next.delete(member.nationalId);
                        setSelectedMembers(next);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        color="#f44336"
                        size={20}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {selectedMembers.size === 0 && !nationalId && (
              <View style={styles.section}>
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    color="#ccc"
                    size={32}
                  />
                  <Text style={styles.emptyText}>
                    Chưa có thành viên nào được chọn
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleConfirm}
              disabled={isPending || selectedMembers.size === 0}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="account-plus"
                    color="#fff"
                    size={16}
                  />
                  <Text style={styles.primaryButtonText}>
                    Thêm thành viên ({selectedMembers.size})
                  </Text>
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
