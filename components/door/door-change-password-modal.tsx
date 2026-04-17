import ApartmentModal from "@/components/apartment/apartment-modal"
import {
     DOOR_PASSWORD_LENGTH,
     isValidDoorPassword,
     sanitizeDoorPassword,
} from "@/components/door/door-password.share"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type DoorChangePasswordModalProps = {
     visible: boolean
     isUpdating?: boolean
     onClose: () => void
     onSubmit: (payload: { oldPin: string; newPin: string }) => void | Promise<void>
     title?: string
}

export default function DoorChangePasswordModal({
     visible,
     isUpdating = false,
     onClose,
     onSubmit,
     title = "Đổi mật khẩu cửa",
}: DoorChangePasswordModalProps) {
     const [oldPin, setOldPin] = useState("")
     const [newPin, setNewPin] = useState("")
     const [errorText, setErrorText] = useState("")
     const [showOld, setShowOld] = useState(false)
     const [showNew, setShowNew] = useState(false)

     const isSubmitDisabled =
          isUpdating ||
          !isValidDoorPassword(oldPin) ||
          !isValidDoorPassword(newPin)

     useEffect(() => {
          if (!visible) {
               setOldPin("")
               setNewPin("")
               setErrorText("")
               setShowOld(false)
               setShowNew(false)
          }
     }, [visible])

     const handleClose = () => {
          if (!isUpdating) {
               onClose()
          }
     }

     const handleSubmit = () => {
          if (isSubmitDisabled) return

          if (oldPin === newPin) {
               setErrorText("Mật khẩu mới phải khác mật khẩu cũ")
               return
          }

          setErrorText("")
          void onSubmit({ oldPin, newPin })
     }

     const updatePin = (setPin: (value: string) => void) => (value: string) => {
          if (errorText) setErrorText("")
          setPin(value)
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
               description={`Nhập mật khẩu cũ và mật khẩu mới gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`}
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
               {renderInput(
                    oldPin,
                    updatePin(setOldPin),
                    "Mật khẩu cũ",
                    !showOld,
                    () => setShowOld((prev) => !prev),
               )}
               {renderInput(
                    newPin,
                    updatePin(setNewPin),
                    "Mật khẩu mới",
                    !showNew,
                    () => setShowNew((prev) => !prev),
               )}

               <Text style={styles.hintText}>Mật khẩu cửa phải gồm đúng {DOOR_PASSWORD_LENGTH} chữ số.</Text>
               {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
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
     errorText: {
          fontSize: 12,
          color: "#dc2626",
     },
})
