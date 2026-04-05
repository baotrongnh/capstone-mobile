import React from "react"
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"

type ChangeHousePasswordModalProps = {
    visible: boolean
    newHousePassword: string
    confirmNewHousePassword: string
    isUpdating: boolean
    onChangeNewPassword: (value: string) => void
    onChangeConfirmPassword: (value: string) => void
    onClose: () => void
    onSubmit: () => void
}

export default function ChangeHousePasswordModal({
    visible,
    newHousePassword,
    confirmNewHousePassword,
    isUpdating,
    onChangeNewPassword,
    onChangeConfirmPassword,
    onClose,
    onSubmit,
}: ChangeHousePasswordModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Đổi mật khẩu cửa</Text>
                    <Text style={styles.modalSubtitle}>Nhập mật khẩu mới gồm 4 đến 12 chữ số</Text>

                    <TextInput
                        value={newHousePassword}
                        onChangeText={(text) => onChangeNewPassword(text.replace(/\D/g, "").slice(0, 12))}
                        placeholder="Mật khẩu mới"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={12}
                        style={styles.modalInput}
                    />

                    <TextInput
                        value={confirmNewHousePassword}
                        onChangeText={(text) => onChangeConfirmPassword(text.replace(/\D/g, "").slice(0, 12))}
                        placeholder="Xác nhận mật khẩu mới"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={12}
                        style={styles.modalInput}
                    />

                    <View style={styles.modalActions}>
                        <Pressable
                            onPress={onClose}
                            disabled={isUpdating}
                            style={[styles.modalButton, styles.modalCancelButton]}
                        >
                            <Text style={styles.modalCancelButtonText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={onSubmit}
                            disabled={isUpdating}
                            style={[styles.modalButton, styles.modalSubmitButton]}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.modalSubmitButtonText}>Lưu</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 380,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        padding: 18,
        gap: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0f172a",
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#64748b",
        marginBottom: 4,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#dbe5f3",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 12,
        paddingVertical: 11,
        color: "#0f172a",
        fontSize: 14,
    },
    modalActions: {
        marginTop: 4,
        flexDirection: "row",
        gap: 10,
    },
    modalButton: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelButton: {
        backgroundColor: "#eef2f7",
        borderWidth: 1,
        borderColor: "#dbe5f3",
    },
    modalCancelButtonText: {
        color: "#334155",
        fontWeight: "700",
    },
    modalSubmitButton: {
        backgroundColor: "#2563eb",
    },
    modalSubmitButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
})
