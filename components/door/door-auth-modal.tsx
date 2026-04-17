import ApartmentModal from "@/components/apartment/apartment-modal"
import { DOOR_PASSWORD_LENGTH } from "@/components/door/door-password.share"
import React, { useEffect, useRef } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { DoorDeviceOption } from "../device/device-grid"

type DoorAuthModalProps = {
     visible: boolean
     doorDevices: DoorDeviceOption[]
     doorOnlineMap?: Record<string, boolean>
     selectedDoorId: string
     pin: string
     error?: string
     isConfirmLoading?: boolean
     disableConfirm?: boolean
     onSelectDoor: (doorId: string) => void
     onChangePin: (value: string) => void
     onClose: () => void
     onAfterClose?: () => void
     onConfirm: () => void
}

export default function DoorAuthModal({
     visible,
     doorDevices,
     doorOnlineMap = {},
     selectedDoorId,
     pin,
     error,
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
               title="Xác thực mở cửa"
               description={`Nhập đủ ${DOOR_PASSWORD_LENGTH} số để mở cửa`}
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
                                   <Text style={styles.confirmText}>Mở cửa</Text>
                              )}
                         </Pressable>
                    </>
               }
          >
               {doorDevices.length > 1 ? (
                    <View style={styles.doorOptionsWrap}>
                         {doorDevices.map((item) => {
                              const isSelected = item.id === selectedDoorId
                              const isDoorOnline = doorOnlineMap[item.espId] === true
                              return (
                                   <Pressable
                                        key={item.id}
                                        onPress={() => onSelectDoor(item.id)}
                                        disabled={!isDoorOnline}
                                        style={[
                                             styles.doorOption,
                                             isSelected && styles.doorOptionActive,
                                             !isDoorOnline && styles.doorOptionDisabled,
                                        ]}
                                   >
                                        <Text
                                             numberOfLines={1}
                                             style={[
                                                  styles.doorOptionText,
                                                  isSelected && styles.doorOptionTextActive,
                                                  !isDoorOnline && styles.doorOptionTextDisabled,
                                             ]}
                                        >
                                             {isDoorOnline ? item.label : `${item.label} (Offline)`}
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
                    style={styles.hiddenInput}
               />

               {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
     doorOptionDisabled: {
          opacity: 0.5,
          backgroundColor: "#e2e8f0",
     },
     doorOptionText: {
          color: "#0f172a",
          fontSize: 12,
          fontWeight: "600",
     },
     doorOptionTextActive: {
          color: "#1d4ed8",
     },
     doorOptionTextDisabled: {
          color: "#64748b",
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
     errorText: {
          marginTop: 8,
          color: "#dc2626",
          fontSize: 13,
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
