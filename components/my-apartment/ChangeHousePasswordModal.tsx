import { ChangeHousePasswordModalProps } from "@/types/apartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"

export default function ChangeHousePasswordModal({
    visible,
    oldHousePassword,
    newHousePassword,
    confirmNewHousePassword,
    isUpdating,
    isFirstPassSetup = false,
    helperText,
    passwordLength = 6,
    onChangeOldPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    onClose,
    onSubmit,
}: ChangeHousePasswordModalProps) {
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        if (!visible) {
            setShowOldPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
        }
    }, [visible])

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>
                        {isFirstPassSetup ? "Thiết lập mật khẩu cửa lần đầu" : "Đổi mật khẩu cửa"}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                        {helperText || (isFirstPassSetup
                            ? "Vì chính sách bảo mật, vui lòng thiết lập mật khẩu cửa lần đầu để sử dụng cửa. Mật khẩu mới cần gồm 6 chữ số."
                            : "Nhập mật khẩu hiện tại và mật khẩu mới gồm 6 chữ số")}
                    </Text>

                    {!isFirstPassSetup ? (
                        <View style={styles.modalInputWrap}>
                            <TextInput
                                value={oldHousePassword}
                                onChangeText={(text) => onChangeOldPassword(text.replace(/\D/g, "").slice(0, passwordLength))}
                                placeholder="Mật khẩu hiện tại"
                                placeholderTextColor="#94a3b8"
                                keyboardType="number-pad"
                                secureTextEntry={!showOldPassword}
                                maxLength={passwordLength}
                                style={styles.modalInput}
                            />
                            <Pressable
                                style={styles.inputActionButton}
                                onPress={() => setShowOldPassword((prev) => !prev)}
                            >
                                <MaterialCommunityIcons
                                    name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color="#475569"
                                />
                            </Pressable>
                        </View>
                    ) : null}

                    <View style={styles.modalInputWrap}>
                        <TextInput
                            value={newHousePassword}
                            onChangeText={(text) => onChangeNewPassword(text.replace(/\D/g, "").slice(0, passwordLength))}
                            placeholder="Mật khẩu mới"
                            placeholderTextColor="#94a3b8"
                            keyboardType="number-pad"
                            secureTextEntry={!showNewPassword}
                            maxLength={passwordLength}
                            style={styles.modalInput}
                        />
                        <Pressable
                            style={styles.inputActionButton}
                            onPress={() => setShowNewPassword((prev) => !prev)}
                        >
                            <MaterialCommunityIcons
                                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                size={18}
                                color="#475569"
                            />
                        </Pressable>
                    </View>

                    <View style={styles.modalInputWrap}>
                        <TextInput
                            value={confirmNewHousePassword}
                            onChangeText={(text) => onChangeConfirmPassword(text.replace(/\D/g, "").slice(0, passwordLength))}
                            placeholder="Xác nhận mật khẩu mới"
                            placeholderTextColor="#94a3b8"
                            keyboardType="number-pad"
                            secureTextEntry={!showConfirmPassword}
                            maxLength={passwordLength}
                            style={styles.modalInput}
                        />
                        <Pressable
                            style={styles.inputActionButton}
                            onPress={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            <MaterialCommunityIcons
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={18}
                                color="#475569"
                            />
                        </Pressable>
                    </View>

                    <View style={styles.modalActions}>
                        {!isFirstPassSetup ? (
                            <Pressable
                                onPress={onClose}
                                disabled={isUpdating}
                                style={[styles.modalButton, styles.modalCancelButton]}
                            >
                                <Text style={styles.modalCancelButtonText}>Hủy</Text>
                            </Pressable>
                        ) : null}
                        <Pressable
                            onPress={onSubmit}
                            disabled={isUpdating}
                            style={[styles.modalButton, styles.modalSubmitButton]}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.modalSubmitButtonText}>
                                    {isFirstPassSetup ? "Thiết lập mật khẩu" : "Lưu"}
                                </Text>
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
    modalInputWrap: {
        borderWidth: 1,
        borderColor: "#dbe5f3",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        paddingLeft: 12,
        paddingRight: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    modalInput: {
        flex: 1,
        paddingVertical: 11,
        color: "#0f172a",
        fontSize: 14,
    },
    inputActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
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
