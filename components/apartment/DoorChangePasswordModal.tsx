import ApartmentModal from "@/components/apartment/ApartmentModal"
import {
     DOOR_PASSWORD_LENGTH,
     isValidDoorPassword,
     sanitizeDoorPassword,
} from "@/components/apartment/door-password"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type DoorChangePasswordModalProps = {
     visible: boolean
     isUpdating?: boolean
     onClose: () => void
     onSubmit: (password: string) => void | Promise<void>
     title?: string
}

export default function DoorChangePasswordModal({
     visible,
     isUpdating = false,
     onClose,
     onSubmit,
     title = "Đổi mật khẩu cửa",
}: DoorChangePasswordModalProps) {
     const [value, setValue] = useState("")
     const [confirmValue, setConfirmValue] = useState("")
     const [showNew, setShowNew] = useState(false)
     const [showConfirm, setShowConfirm] = useState(false)

     const isSubmitDisabled =
          isUpdating ||
          !isValidDoorPassword(value) ||
          !isValidDoorPassword(confirmValue) ||
          value !== confirmValue

     useEffect(() => {
          if (!visible) {
               setValue("")
               setConfirmValue("")
               setShowNew(false)
               setShowConfirm(false)
          }
     }, [visible])

     const handleClose = () => {
          if (!isUpdating) {
               onClose()
          }
     }

     const handleSubmit = () => {
          if (!isSubmitDisabled) {
               void onSubmit(value)
          }
     }

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
                    onChangeText={(text) => onChange(sanitizeDoorPassword(text))}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    secureTextEntry={secure}
                    maxLength={DOOR_PASSWORD_LENGTH}
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
               title={title}
               description={`Nhập mật khẩu mới gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`}
               onClose={handleClose}
               disableBackdropClose={isUpdating}
               footer={
                    <>
                         <Pressable
                              onPress={handleClose}
                              disabled={isUpdating}
                              style={[styles.actionBtn, styles.cancelBtn]}
                         >
                              <Text style={styles.cancelText}>Hủy</Text>
                         </Pressable>
                         <Pressable
                              onPress={handleSubmit}
                              disabled={isSubmitDisabled}
                              style={[styles.actionBtn, styles.submitBtn, isSubmitDisabled && styles.submitBtnDisabled]}
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
               {renderInput(value, setValue, "Mật khẩu mới", !showNew, () => setShowNew((prev) => !prev))}
               {renderInput(
                    confirmValue,
                    setConfirmValue,
                    "Xác nhận mật khẩu mới",
                    !showConfirm,
                    () => setShowConfirm((prev) => !prev),
               )}

               <Text style={styles.hintText}>Mật khẩu cửa phải gồm đúng {DOOR_PASSWORD_LENGTH} chữ số.</Text>
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
     submitBtnDisabled: {
          opacity: 0.6,
     },
     submitText: {
          color: "#ffffff",
          fontWeight: "700",
     },
     hintText: {
          fontSize: 12,
          color: "#64748b",
     },
})
