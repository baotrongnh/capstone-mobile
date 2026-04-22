
import DoorChangePasswordModal from "@/components/door/door-change-password-modal"
import {
     DOOR_PASSWORD_LENGTH,
     isValidDoorPassword,
     sanitizeDoorPassword,
} from "@/components/door/door-password.share"
import { getApiErrorMessage } from "@/utils/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
     Alert,
     Pressable,
     StyleSheet,
     Text,
     View,
} from "react-native"
import { DoorDeviceOption } from "../device/device-grid"
import DoorAuthModal from "./door-auth-modal"


interface DoorAccessCardProps {
     title?: string
     doorDevices: DoorDeviceOption[]
     doorOnlineMap?: Record<string, boolean>
     doorLockedMap?: Record<string, boolean>
     pending?: {
          openingDoor?: boolean
          changingDoorPin?: boolean
     }
     actions: {
          openDoor: (device: DoorDeviceOption, pin: string) => Promise<boolean>
          requestRenameDoor: (device: DoorDeviceOption) => void
          viewDoorHistory?: () => void
          changeDoorPassword: (payload: { doorDevice: DoorDeviceOption; oldPin: string; newPin: string }) => Promise<boolean>
     }
}

export default function DoorAccessCard({
     title = "Mở cửa chính",
     doorDevices,
     doorOnlineMap = {},
     doorLockedMap = {},
     pending = {},
     actions,
}: DoorAccessCardProps) {
     const [modalVisible, setModalVisible] = useState(false)
     const [pin, setPin] = useState("")
     const [error, setError] = useState("")
     const [selectedDoorId, setSelectedDoorId] = useState("")
     const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
     const [isAuthenticating, setIsAuthenticating] = useState(false)

     const supportWarningMessage = "Mạch cửa đang bị khóa. Vui lòng liên hệ nhân viên hỗ trợ để biết thêm chi tiết và được hỗ trợ."

     const selectedDoor = doorDevices.find((item) => item.id === selectedDoorId) ?? doorDevices[0]
     const hasDoorDevice = doorDevices.length > 0
     const isSelectedDoorOnline = selectedDoor ? doorOnlineMap[selectedDoor.espId] === true : false
     const isSelectedDoorLocked = selectedDoor ? doorLockedMap[selectedDoor.espId] === true : false
     const isDoorLocked = doorDevices.length > 0 && doorDevices.every((device) => doorLockedMap[device.espId] === true)
     const isDoorOffline = doorDevices.length > 0 && doorDevices.every((device) => doorOnlineMap[device.espId] === false)
     const isDoorControlDisabled = isDoorOffline || isDoorLocked
     const disableDoorActions = !hasDoorDevice || isDoorControlDisabled

     const getDisabledMessage = () => {
          if (!hasDoorDevice) {
               return "Căn hộ này chưa có thiết bị cửa để điều khiển"
          }

          if (isDoorLocked) {
               return supportWarningMessage
          }

          return "Thiết bị cửa đang offline, không thể điều khiển"
     }

     const resetAuthState = () => {
          setPin("")
          setError("")
     }

     const openDoorAuthModal = () => {
          if (disableDoorActions) {
               Alert.alert("Thông báo", getDisabledMessage())
               return
          }

          resetAuthState()
          setSelectedDoorId((prev) => prev || doorDevices[0]?.id || "")
          setModalVisible(true)
     }

     const openChangePasswordModal = () => {
          if (disableDoorActions) {
               Alert.alert("Thông báo", getDisabledMessage())
               return
          }

          setSelectedDoorId((prev) => prev || doorDevices[0]?.id || "")
          setShowChangePasswordModal(true)
     }

     const closeModal = () => {
          setModalVisible(false)
     }

     const openDoorHistory = () => {
          actions.viewDoorHistory?.()
     }

     const handleAuthModalClosed = () => {
          resetAuthState()
          setSelectedDoorId(doorDevices[0]?.id || "")
     }

     const onLongPressDoor = () => {
          if (disableDoorActions) {
               Alert.alert("Thông báo", getDisabledMessage())
               return
          }

          const targetDoor = selectedDoor || doorDevices[0]
          if (!targetDoor) {
               return
          }

          actions.requestRenameDoor(targetDoor)
     }

     const handleVerifyPin = async (enteredPin: string) => {
          if (isAuthenticating) {
               return
          }

          if (!selectedDoor) {
               setError("Vui lòng chọn cửa để mở")
               return
          }

          if (isSelectedDoorLocked) {
               setError(supportWarningMessage)
               return
          }

          if (!isSelectedDoorOnline) {
               setError("Thiết bị cửa đang offline")
               return
          }

          if (!isValidDoorPassword(enteredPin)) {
               setError(`Mật khẩu cửa phải gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`)
               return
          }

          try {
               setIsAuthenticating(true)
               const isUnlockSuccess = await actions.openDoor(selectedDoor, enteredPin)

               if (!isUnlockSuccess) {
                    setError("Mật khẩu không đúng hoặc thiết bị không phản hồi")
                    setPin("")
                    return
               }

               closeModal()
               Alert.alert("Thành công", "Cửa đã được mở")
          } catch (openDoorError) {
               Alert.alert("Lỗi", getApiErrorMessage(openDoorError, "Không thể mở cửa lúc này"))
          } finally {
               setIsAuthenticating(false)
          }
     }

     const onPinChange = (text: string) => {
          const nextPin = sanitizeDoorPassword(text)
          setPin(nextPin)
          if (error) {
               setError("")
          }

          if (nextPin.length === DOOR_PASSWORD_LENGTH) {
               void handleVerifyPin(nextPin)
          }
     }

     const submitChangePassword = async ({ oldPin, newPin }: { oldPin: string; newPin: string }) => {
          if (!isValidDoorPassword(oldPin) || !isValidDoorPassword(newPin)) {
               Alert.alert("Thông báo", `Mật khẩu cửa phải gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`)
               return
          }

          if (!selectedDoor) {
               Alert.alert("Thông báo", "Không xác định được cửa để đổi mật khẩu")
               return
          }

          if (doorLockedMap[selectedDoor.espId] === true) {
               Alert.alert("Thông báo", supportWarningMessage)
               return
          }

          try {
               const isUpdated = await actions.changeDoorPassword({
                    doorDevice: selectedDoor,
                    oldPin,
                    newPin,
               })

               if (!isUpdated) {
                    Alert.alert("Thông báo", "Mật khẩu hiện tại không đúng hoặc thiết bị không phản hồi")
                    return
               }

               setShowChangePasswordModal(false)
               Alert.alert("Thành công", "Đã đổi mật khẩu cửa nhà")
          } catch (changePasswordError) {
               Alert.alert("Lỗi", getApiErrorMessage(changePasswordError, "Không thể đổi mật khẩu lúc này"))
          }
     }

     return (
          <>
               <Pressable
                    onLongPress={onLongPressDoor}
                    delayLongPress={350}
               >
                    {({ pressed }) => (
                         <View style={[styles.card, isDoorLocked && styles.cardDisabled, pressed && styles.cardPressed]}>
                              <View style={styles.sectionHeaderRow}>
                                   <Text style={styles.sectionLabel}>Cửa ra vào</Text>
                                   <View style={styles.headerActions}>
                                        <Pressable
                                             onPress={openDoorHistory}
                                             style={styles.historyBtn}
                                             hitSlop={6}
                                        >
                                             <MaterialCommunityIcons name="history" size={14} color="#1d4ed8" />
                                        </Pressable>
                                        <Pressable
                                             onPress={openChangePasswordModal}
                                             disabled={disableDoorActions}
                                             style={[styles.changePasswordBtn, disableDoorActions && styles.changePasswordBtnDisabled]}
                                        >
                                             <MaterialCommunityIcons name="lock-reset" size={14} color="#1d4ed8" />
                                             <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
                                        </Pressable>
                                   </View>
                              </View>

                              <View style={styles.row}>
                                   <View style={styles.icon}>
                                        <MaterialCommunityIcons name="door-closed-lock" size={30} color="#1f2937" />
                                   </View>
                                   <Pressable
                                        onPress={openDoorAuthModal}
                                        disabled={disableDoorActions}
                                        style={[styles.unlockButton, disableDoorActions && styles.unlockButtonDisabled]}
                                        hitSlop={10}
                                   >
                                        <View style={[styles.unlockIconWrap, disableDoorActions && styles.unlockIconWrapDisabled]}>
                                             <MaterialCommunityIcons
                                                  name={disableDoorActions ? "lock-outline" : "lock-open-variant-outline"}
                                                  size={18}
                                                  color="#ffffff"
                                             />
                                        </View>
                                        <Text style={[styles.unlockText, disableDoorActions && styles.unlockTextDisabled]}>
                                             Mở khóa
                                        </Text>
                                   </Pressable>
                              </View>

                              <Text style={styles.title}>{title}</Text>
                              <Text style={styles.caption}>
                                   {hasDoorDevice
                                        ? isDoorLocked
                                             ? supportWarningMessage
                                             : isDoorControlDisabled
                                                  ? "Thiết bị cửa đang offline"
                                                  : "Nhấn để mở khóa, nhấn giữ để đổi tên"
                                        : "Chưa có thiết bị cửa trong căn hộ"}
                              </Text>
                         </View>
                    )}
               </Pressable>

               <DoorAuthModal
                    visible={modalVisible}
                    doorDevices={doorDevices}
                    doorOnlineMap={doorOnlineMap}
                    doorLockedMap={doorLockedMap}
                    selectedDoorId={selectedDoor?.id || ""}
                    pin={pin}
                    error={error}
                    isConfirmLoading={pending.openingDoor || isAuthenticating}
                    disableConfirm={
                         isDoorControlDisabled ||
                         isSelectedDoorLocked ||
                         !isSelectedDoorOnline ||
                         isAuthenticating ||
                         pending.openingDoor ||
                         pin.length !== DOOR_PASSWORD_LENGTH
                    }
                    onSelectDoor={setSelectedDoorId}
                    onChangePin={onPinChange}
                    onClose={closeModal}
                    onAfterClose={handleAuthModalClosed}
                    onConfirm={() => {
                         void handleVerifyPin(pin)
                    }}
               />

               <DoorChangePasswordModal
                    visible={showChangePasswordModal}
                    isUpdating={pending.changingDoorPin}
                    onClose={() => {
                         if (!pending.changingDoorPin) {
                              setShowChangePasswordModal(false)
                         }
                    }}
                    onSubmit={(payload) => {
                         void submitChangePassword(payload)
                    }}
               />
          </>
     )
}

const styles = StyleSheet.create({
     card: {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#dbeafe",
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 15,
          minHeight: 126,
          justifyContent: "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
          marginBottom: 12,
     },
     cardPressed: {
          opacity: 0.9,
     },
     cardDisabled: {
          opacity: 0.62,
     },
     row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
     },
     icon: {
          backgroundColor: "#eff6ff",
          borderRadius: 24,
          padding: 10,
          borderWidth: 1,
          borderColor: "#dbeafe",
          alignItems: "center",
          justifyContent: "center",
     },
     unlockButton: {
          minWidth: 118,
          height: 46,
          borderRadius: 23,
          backgroundColor: "#eef4ff",
          borderWidth: 1,
          borderColor: "#bfdbfe",
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
     },
     unlockButtonDisabled: {
          backgroundColor: "#f1f5f9",
          borderColor: "#cbd5e1",
     },
     unlockIconWrap: {
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#2563eb",
          alignItems: "center",
          justifyContent: "center",
     },
     unlockIconWrapDisabled: {
          backgroundColor: "#94a3b8",
     },
     unlockText: {
          color: "#1d4ed8",
          fontSize: 13,
          fontWeight: "700",
     },
     unlockTextDisabled: {
          color: "#64748b",
     },
     title: {
          fontSize: 16,
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: 4,
     },
     caption: {
          fontSize: 13,
          color: "#475569",
     },
     sectionHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
     },
     headerActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
     },
     sectionLabel: {
          fontSize: 13,
          color: "#475569",
          fontWeight: "600",
     },
     historyBtn: {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#dbeafe",
          backgroundColor: "#eff6ff",
          alignItems: "center",
          justifyContent: "center",
     },
     changePasswordBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#dbeafe",
          backgroundColor: "#eff6ff",
          paddingHorizontal: 9,
          paddingVertical: 5,
     },
     changePasswordBtnDisabled: {
          opacity: 0.55,
     },
     changePasswordText: {
          fontSize: 11,
          fontWeight: "600",
          color: "#1d4ed8",
     },
})