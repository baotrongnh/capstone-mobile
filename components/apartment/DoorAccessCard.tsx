import DoorAuthModal, { type DoorActionMode } from "@/components/apartment/DoorAuthModal"
import DoorChangePasswordModal from "@/components/apartment/DoorChangePasswordModal"
import type { DoorDeviceOption } from "@/components/apartment/DeviceGrid"
import {
     DOOR_PASSWORD_LENGTH,
     DOOR_PASSWORD_LOCK_SECONDS,
     MAX_DOOR_PASSWORD_FAILED_ATTEMPTS,
     isValidDoorPassword,
     sanitizeDoorPassword,
} from "@/components/apartment/door-password"
import { getApiErrorMessage } from "@/utils/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
     Alert,
     Pressable,
     StyleSheet,
     Text,
     View,
} from "react-native"

interface DoorAccessCardProps {
     title?: string
     doorDevices: DoorDeviceOption[]
     expectedPassword?: string | null
     isDoorPasswordLoading?: boolean
     isOpeningDoor?: boolean
     isChangingHousePassword?: boolean
     onOpenDoor: (device: DoorDeviceOption) => Promise<void>
     onRequestRenameDoor: (device: DoorDeviceOption) => void
     onChangeHousePassword: (nextPassword: string) => Promise<void>
}

export default function DoorAccessCard({
     title = "Mở cửa chính",
     doorDevices,
     expectedPassword,
     isDoorPasswordLoading = false,
     isOpeningDoor = false,
     isChangingHousePassword = false,
     onOpenDoor,
     onRequestRenameDoor,
     onChangeHousePassword,
}: DoorAccessCardProps) {
     const [modalVisible, setModalVisible] = useState(false)
     const [pin, setPin] = useState("")
     const [error, setError] = useState("")
     const [failedAttempts, setFailedAttempts] = useState(0)
     const [lockedSeconds, setLockedSeconds] = useState(0)
     const [selectedDoorId, setSelectedDoorId] = useState("")
     const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
     const [shouldOpenChangePasswordModal, setShouldOpenChangePasswordModal] = useState(false)
     const [mode, setMode] = useState<DoorActionMode>("open-door")
     const [isAuthenticating, setIsAuthenticating] = useState(false)

     const selectedDoor = doorDevices.find((item) => item.id === selectedDoorId) ?? doorDevices[0]
     const hasDoorDevice = doorDevices.length > 0

     const resetAuthState = () => {
          setPin("")
          setError("")
     }

     const openModal = (nextMode: DoorActionMode) => {
          if (!hasDoorDevice) {
               Alert.alert("Thông báo", "Căn hộ này chưa có thiết bị cửa để điều khiển")
               return
          }

          setMode(nextMode)
          resetAuthState()
          setSelectedDoorId((prev) => prev || doorDevices[0]?.id || "")
          setModalVisible(true)
     }

     const closeModal = () => {
          setModalVisible(false)
     }

     const handleAuthModalClosed = () => {
          resetAuthState()
          setSelectedDoorId(doorDevices[0]?.id || "")
          setMode("open-door")

          if (shouldOpenChangePasswordModal) {
               setShouldOpenChangePasswordModal(false)
               setShowChangePasswordModal(true)
          }
     }

     const onLongPressDoor = () => {
          if (!hasDoorDevice) {
               Alert.alert("Thông báo", "Căn hộ này chưa có thiết bị cửa để điều khiển")
               return
          }

          const targetDoor = selectedDoor || doorDevices[0]
          if (!targetDoor) {
               return
          }

          onRequestRenameDoor(targetDoor)
     }

     const onPressOpenDoor = () => {
          openModal("open-door")
     }

     const handleWrongPassword = () => {
          const nextAttempt = failedAttempts + 1

          if (nextAttempt >= MAX_DOOR_PASSWORD_FAILED_ATTEMPTS) {
               setFailedAttempts(0)
               setLockedSeconds(DOOR_PASSWORD_LOCK_SECONDS)
               setError(`Sai ${MAX_DOOR_PASSWORD_FAILED_ATTEMPTS} lần. Vui lòng thử lại sau ${DOOR_PASSWORD_LOCK_SECONDS} giây.`)
               setPin("")
               return
          }

          setFailedAttempts(nextAttempt)
          setError(`Mật khẩu không đúng (${nextAttempt}/${MAX_DOOR_PASSWORD_FAILED_ATTEMPTS})`)
          setPin("")
     }

     const handleVerifyPin = async (enteredPin: string) => {
          if (isAuthenticating || isDoorPasswordLoading || lockedSeconds > 0) {
               return
          }

          if (mode === "open-door" && !selectedDoor) {
               setError("Vui lòng chọn cửa để mở")
               return
          }

          if (!isValidDoorPassword(enteredPin)) {
               setError(`Mật khẩu cửa phải gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`)
               return
          }

          if (!expectedPassword || !isValidDoorPassword(expectedPassword)) {
               setError("Không lấy được mật khẩu cửa hợp lệ từ hệ thống")
               return
          }

          if (enteredPin !== expectedPassword) {
               handleWrongPassword()
               return
          }

          if (mode === "change-password") {
               setFailedAttempts(0)
               setShouldOpenChangePasswordModal(true)
               closeModal()
               return
          }

          try {
               setIsAuthenticating(true)
               await onOpenDoor(selectedDoor)
               setFailedAttempts(0)
               closeModal()
               Alert.alert("Thành công", "Cửa đã được mở")
          } catch (openDoorError) {
               Alert.alert("Lỗi", getApiErrorMessage(openDoorError, "Không thể mở cửa lúc này"))
          } finally {
               setIsAuthenticating(false)
          }
     }

     const onPinChange = (text: string) => {
          if (lockedSeconds > 0) {
               return
          }

          const nextPin = sanitizeDoorPassword(text)
          setPin(nextPin)
          if (error) {
               setError("")
          }

          if (nextPin.length === DOOR_PASSWORD_LENGTH) {
               void handleVerifyPin(nextPin)
          }
     }

     const submitChangePassword = async (nextPassword: string) => {
          if (!isValidDoorPassword(nextPassword)) {
               Alert.alert("Thông báo", `Mật khẩu nhà phải gồm đúng ${DOOR_PASSWORD_LENGTH} chữ số`)
               return
          }

          try {
               await onChangeHousePassword(nextPassword)
               setShowChangePasswordModal(false)
               Alert.alert("Thành công", "Đã đổi mật khẩu cửa nhà")
          } catch (changePasswordError) {
               Alert.alert("Lỗi", getApiErrorMessage(changePasswordError, "Không thể đổi mật khẩu lúc này"))
          }
     }

     useEffect(() => {
          if (lockedSeconds <= 0) {
               return
          }

          const timer = setInterval(() => {
               setLockedSeconds((prev) => {
                    if (prev <= 1) {
                         clearInterval(timer)
                         return 0
                    }
                    return prev - 1
               })
          }, 1000)

          return () => clearInterval(timer)
     }, [lockedSeconds])

     return (
          <>
               <Pressable
                    onLongPress={onLongPressDoor}
                    delayLongPress={350}
               >
                    {({ pressed }) => (
                         <View style={[styles.card, pressed && styles.cardPressed]}>
                              <View style={styles.sectionHeaderRow}>
                                   <Text style={styles.sectionLabel}>Cửa ra vào</Text>
                                   <Pressable
                                        onPress={() => openModal("change-password")}
                                        disabled={!hasDoorDevice}
                                        style={[styles.changePasswordBtn, !hasDoorDevice && styles.changePasswordBtnDisabled]}
                                   >
                                        <MaterialCommunityIcons name="lock-reset" size={14} color="#1d4ed8" />
                                        <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
                                   </Pressable>
                              </View>

                              <View style={styles.row}>
                                   <View style={styles.icon}>
                                        <MaterialCommunityIcons name="door-closed-lock" size={30} color="#1f2937" />
                                   </View>
                                   <Pressable
                                        onPress={onPressOpenDoor}
                                        disabled={!hasDoorDevice}
                                        style={[styles.switchButton, !hasDoorDevice && styles.switchButtonDisabled]}
                                        hitSlop={10}
                                   >
                                        <MaterialCommunityIcons name="power" size={24} color="#fff" />
                                   </Pressable>
                              </View>

                              <Text style={styles.title}>{title}</Text>
                              <Text style={styles.caption}>
                                   {hasDoorDevice
                                        ? "Nhấn để mở khóa, nhấn giữ để đổi tên"
                                        : "Chưa có thiết bị cửa trong căn hộ"}
                              </Text>
                         </View>
                    )}
               </Pressable>

               <DoorAuthModal
                    visible={modalVisible}
                    mode={mode}
                    doorDevices={doorDevices}
                    selectedDoorId={selectedDoor?.id || ""}
                    pin={pin}
                    error={error}
                    lockedSeconds={lockedSeconds}
                    isDoorPasswordLoading={isDoorPasswordLoading}
                    isConfirmLoading={mode === "open-door" && (isOpeningDoor || isAuthenticating)}
                    disableConfirm={
                         lockedSeconds > 0 ||
                         isDoorPasswordLoading ||
                         isAuthenticating ||
                         (mode === "open-door" && isOpeningDoor) ||
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
                    isUpdating={isChangingHousePassword}
                    onClose={() => {
                         if (!isChangingHousePassword) {
                              setShowChangePasswordModal(false)
                         }
                    }}
                    onSubmit={(password) => {
                         void submitChangePassword(password)
                    }}
               />
          </>
     )
}

const styles = StyleSheet.create({
     card: {
          backgroundColor: "#f8fafc",
          borderWidth: 1,
          borderColor: "#dbe7ff",
          borderRadius: 16,
          padding: 18,
          minHeight: 126,
          justifyContent: "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          marginBottom: 12,
     },
     cardPressed: {
          opacity: 0.78,
     },
     row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
     },
     icon: {
          backgroundColor: "#fff",
          borderRadius: 24,
          padding: 10,
          alignItems: "center",
          justifyContent: "center",
     },
     switchButton: {
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#2563eb",
          alignItems: "center",
          justifyContent: "center",
          elevation: 3,
          shadowColor: "#1d4ed8",
          shadowOpacity: 0.25,
          shadowRadius: 8,
     },
     switchButtonDisabled: {
          backgroundColor: "#94a3b8",
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
     sectionLabel: {
          fontSize: 13,
          color: "#475569",
          fontWeight: "600",
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