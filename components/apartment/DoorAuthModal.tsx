import ApartmentModal from "@/components/apartment/ApartmentModal"
import type { DoorDeviceOption } from "@/components/apartment/DeviceGrid"
import { DOOR_PASSWORD_LENGTH } from "@/components/apartment/door-password"
import React, { useEffect, useRef } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

export type DoorActionMode = "open-door" | "change-password"

type DoorAuthModalProps = {
     visible: boolean
     mode: DoorActionMode
     doorDevices: DoorDeviceOption[]
     selectedDoorId: string
     pin: string
     error?: string
     lockedSeconds: number
     isDoorPasswordLoading?: boolean
     isConfirmLoading?: boolean
     disableConfirm?: boolean
     onSelectDoor: (doorId: string) => void
     onChangePin: (value: string) => void
     onClose: () => void
     onAfterClose?: () => void
     onConfirm: () => void
}

const getAuthTitle = (mode: DoorActionMode) =>
     mode === "open-door" ? "Xác thực mở cửa" : "Xác thực đổi mật khẩu"

const getAuthDescription = (mode: DoorActionMode) =>
     mode === "open-door"
          ? `Nhập đủ ${DOOR_PASSWORD_LENGTH} số để mở cửa`
          : "Nhập mật khẩu hiện tại để tiếp tục đổi mật khẩu"

export default function DoorAuthModal({
     visible,
     mode,
     doorDevices,
     selectedDoorId,
     pin,
     error,
     lockedSeconds,
     isDoorPasswordLoading = false,
     isConfirmLoading = false,
     disableConfirm = false,
     onSelectDoor,
     onChangePin,
     onClose,
     onAfterClose,
     onConfirm,
}: DoorAuthModalProps) {
     const inputRef = useRef<TextInput>(null)

     useEffect(() => {
          if (!visible) {
               return
          }

          const timer = setTimeout(() => inputRef.current?.focus(), 100)
          return () => clearTimeout(timer)
     }, [visible])

     return (
          <ApartmentModal
               visible={visible}
               title={getAuthTitle(mode)}
               description={getAuthDescription(mode)}
               onClose={onClose}
               onAfterClose={onAfterClose}
               liftOnKeyboard
               keyboardLiftOffset={52}
               footer={
                    <>
                         <Pressable onPress={onClose} style={[styles.actionBtn, styles.cancelBtn]}>
                              <Text style={styles.cancelText}>Hủy</Text>
                         </Pressable>
                         <Pressable
                              onPress={onConfirm}
                              disabled={disableConfirm}
                              style={[styles.actionBtn, styles.confirmBtn, disableConfirm && styles.confirmBtnDisabled]}
                         >
                              {isConfirmLoading ? (
                                   <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                   <Text style={styles.confirmText}>{mode === "open-door" ? "Mở cửa" : "Xác nhận"}</Text>
                              )}
                         </Pressable>
                    </>
               }
          >
               {mode === "open-door" && doorDevices.length > 1 ? (
                    <View style={styles.doorOptionsWrap}>
                         {doorDevices.map((item) => {
                              const isSelected = item.id === selectedDoorId
                              return (
                                   <Pressable
                                        key={item.id}
                                        onPress={() => onSelectDoor(item.id)}
                                        style={[styles.doorOption, isSelected && styles.doorOptionActive]}
                                   >
                                        <Text
                                             numberOfLines={1}
                                             style={[styles.doorOptionText, isSelected && styles.doorOptionTextActive]}
                                        >
                                             {item.label}
                                        </Text>
                                   </Pressable>
                              )
                         })}
                    </View>
               ) : null}

               <Pressable style={styles.pinRow} onPress={() => inputRef.current?.focus()}>
                    {Array.from({ length: DOOR_PASSWORD_LENGTH }).map((_, index) => (
                         <View
                              key={index}
                              style={[
                                   styles.pinBox,
                                   pin[index] ? styles.pinBoxFilled : undefined,
                                   error ? styles.pinBoxError : undefined,
                                   lockedSeconds > 0 ? styles.pinBoxLocked : undefined,
                              ]}
                         >
                              <Text style={styles.pinText}>{pin[index] ? "*" : ""}</Text>
                         </View>
                    ))}
               </Pressable>

               <TextInput
                    ref={inputRef}
                    value={pin}
                    onChangeText={onChangePin}
                    keyboardType="number-pad"
                    maxLength={DOOR_PASSWORD_LENGTH}
                    editable={lockedSeconds <= 0}
                    style={styles.hiddenInput}
               />

               {isDoorPasswordLoading ? (
                    <View style={styles.inlineLoading}>
                         <ActivityIndicator size="small" color="#2563eb" />
                         <Text style={styles.inlineLoadingText}>Đang lấy mật khẩu cửa...</Text>
                    </View>
               ) : null}

               {error ? <Text style={styles.errorText}>{error}</Text> : null}
               {lockedSeconds > 0 ? <Text style={styles.lockText}>Bạn có thể thử lại sau {lockedSeconds}s</Text> : null}
          </ApartmentModal>
     )
}

const styles = StyleSheet.create({
     doorOptionsWrap: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
     },
     doorOption: {
          maxWidth: "48%",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 10,
          paddingVertical: 8,
     },
     doorOptionActive: {
          borderColor: "#2563eb",
          backgroundColor: "#eff6ff",
     },
     doorOptionText: {
          color: "#0f172a",
          fontSize: 12,
          fontWeight: "600",
     },
     doorOptionTextActive: {
          color: "#1d4ed8",
     },
     pinRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 2,
     },
     pinBox: {
          borderWidth: 1,
          borderColor: "#cbd5e1",
          borderRadius: 12,
          backgroundColor: "#f8fafc",
          width: 44,
          height: 54,
          alignItems: "center",
          justifyContent: "center",
     },
     pinBoxFilled: {
          borderColor: "#2563eb",
          backgroundColor: "#eff6ff",
     },
     pinBoxError: {
          borderColor: "#ef4444",
     },
     pinBoxLocked: {
          backgroundColor: "#e2e8f0",
     },
     pinText: {
          color: "#0f172a",
          fontSize: 20,
          fontWeight: "700",
     },
     hiddenInput: {
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
     },
     inlineLoading: {
          marginTop: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
     },
     inlineLoadingText: {
          fontSize: 12,
          color: "#64748b",
     },
     errorText: {
          marginTop: 8,
          color: "#dc2626",
          fontSize: 13,
     },
     lockText: {
          marginTop: 6,
          color: "#b45309",
          fontSize: 12,
     },
     actionBtn: {
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
     },
     cancelBtn: {
          flex: 0,
          backgroundColor: "#eef2f7",
     },
     confirmBtn: {
          flex: 0,
          backgroundColor: "#2563eb",
     },
     confirmBtnDisabled: {
          opacity: 0.6,
     },
     confirmText: {
          color: "#ffffff",
          fontWeight: "700",
     },
     cancelText: {
          color: "#0f172a",
          fontWeight: "600",
     },
})
