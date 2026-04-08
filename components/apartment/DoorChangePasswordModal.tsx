import ApartmentModal from "@/components/apartment/ApartmentModal"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type DoorChangePasswordModalProps = {
     visible: boolean
     value: string
     confirmValue: string
     isUpdating?: boolean
     onChangeValue: (value: string) => void
     onChangeConfirmValue: (value: string) => void
     onClose: () => void
     onAfterClose?: () => void
     onSubmit: () => void
     passwordLength?: number
}

export default function DoorChangePasswordModal({
     visible,
     value,
     confirmValue,
     isUpdating = false,
     onChangeValue,
     onChangeConfirmValue,
     onClose,
     onAfterClose,
     onSubmit,
     passwordLength = 6,
}: DoorChangePasswordModalProps) {
     const [showNew, setShowNew] = useState(false)
     const [showConfirm, setShowConfirm] = useState(false)

     useEffect(() => {
          if (!visible) {
               setShowNew(false)
               setShowConfirm(false)
          }
     }, [visible])

     const renderInput = (
          inputValue: string,
          onChange: (value: string) => void,
          placeholder: string,
          secure: boolean,
          onToggleSecure: () => void,
     ) => (
          <View style={styles.inputWrap}>
               <TextInput
                    value={inputValue}
                    onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, passwordLength))}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    secureTextEntry={secure}
                    maxLength={passwordLength}
                    style={styles.input}
               />
               <Pressable style={styles.eyeButton} onPress={onToggleSecure}>
                    <MaterialCommunityIcons
                         name={secure ? "eye-outline" : "eye-off-outline"}
                         size={18}
                         color="#475569"
                    />
               </Pressable>
          </View>
     )

     return (
          <ApartmentModal
               visible={visible}
               title="Đổi mật khẩu cửa"
               description={`Nhập mật khẩu mới gồm đúng ${passwordLength} chữ số`}
               onClose={onClose}
               onAfterClose={onAfterClose}
               disableBackdropClose={isUpdating}
               footer={
                    <>
                         <Pressable
                              onPress={onClose}
                              disabled={isUpdating}
                              style={[styles.actionBtn, styles.cancelBtn]}
                         >
                              <Text style={styles.cancelText}>Hủy</Text>
                         </Pressable>
                         <Pressable
                              onPress={onSubmit}
                              disabled={isUpdating}
                              style={[styles.actionBtn, styles.submitBtn]}
                         >
                              {isUpdating ? (
                                   <ActivityIndicator size="small" color="#ffffff" />
                              ) : (
                                   <Text style={styles.submitText}>Lưu</Text>
                              )}
                         </Pressable>
                    </>
               }
          >
               {renderInput(value, onChangeValue, "Mật khẩu mới", !showNew, () => setShowNew((prev) => !prev))}
               {renderInput(
                    confirmValue,
                    onChangeConfirmValue,
                    "Xác nhận mật khẩu mới",
                    !showConfirm,
                    () => setShowConfirm((prev) => !prev),
               )}
          </ApartmentModal>
     )
}

const styles = StyleSheet.create({
     inputWrap: {
          borderWidth: 1,
          borderColor: "#dbe5f3",
          borderRadius: 12,
          backgroundColor: "#f8fafc",
          paddingLeft: 12,
          paddingRight: 6,
          flexDirection: "row",
          alignItems: "center",
     },
     input: {
          flex: 1,
          paddingVertical: 11,
          color: "#0f172a",
          fontSize: 14,
     },
     eyeButton: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
     },
     actionBtn: {
          minWidth: 100,
          minHeight: 40,
          borderRadius: 10,
          paddingHorizontal: 14,
          alignItems: "center",
          justifyContent: "center",
     },
     cancelBtn: {
          backgroundColor: "#eef2f7",
          borderWidth: 1,
          borderColor: "#dbe5f3",
     },
     cancelText: {
          color: "#334155",
          fontWeight: "700",
     },
     submitBtn: {
          backgroundColor: "#2563eb",
     },
     submitText: {
          color: "#ffffff",
          fontWeight: "700",
     },
})
