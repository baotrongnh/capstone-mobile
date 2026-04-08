import ApartmentModal from "@/components/apartment/ApartmentModal"
import DoorChangePasswordModal from "@/components/apartment/DoorChangePasswordModal"
import type { DoorDeviceOption } from "@/components/apartment/DeviceGrid"
import { getApiErrorMessage } from "@/utils/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import {
     Alert,
     ActivityIndicator,
     Pressable,
     StyleSheet,
     Text,
     TextInput,
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

type DoorActionMode = "open-door" | "change-password"

const PIN_LENGTH = 6
const MAX_FAILED_ATTEMPTS = 3
const LOCK_SECONDS = 30

const sanitizePin = (value: string) => value.replace(/\D/g, "").slice(0, PIN_LENGTH)
const isValidDoorPin = (value: string) => /^\d{6}$/.test(value)

const getAuthTitle = (mode: DoorActionMode) =>
     mode === "open-door" ? "Xác thực mở cửa" : "Xác thực đổi mật khẩu"

const getAuthDescription = (mode: DoorActionMode) =>
     mode === "open-door"
          ? `Nhập đủ ${PIN_LENGTH} số để mở cửa`
          : "Nhập mật khẩu hiện tại để tiếp tục đổi mật khẩu"

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
     const [newHousePassword, setNewHousePassword] = useState("")
     const [confirmNewHousePassword, setConfirmNewHousePassword] = useState("")
     const [mode, setMode] = useState<DoorActionMode>("open-door")
     const [isAuthenticating, setIsAuthenticating] = useState(false)
     const inputRef = useRef<TextInput>(null)

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

          if (nextAttempt >= MAX_FAILED_ATTEMPTS) {
               setFailedAttempts(0)
               setLockedSeconds(LOCK_SECONDS)
               setError(`Sai ${MAX_FAILED_ATTEMPTS} lần. Vui lòng thử lại sau ${LOCK_SECONDS} giây.`)
               setPin("")
               return
          }

          setFailedAttempts(nextAttempt)
          setError(`Mật khẩu không đúng (${nextAttempt}/${MAX_FAILED_ATTEMPTS})`)
          setPin("")
          inputRef.current?.focus()
     }

     const handleVerifyPin = async (enteredPin: string) => {
          if (isAuthenticating || isDoorPasswordLoading || lockedSeconds > 0) {
               return
          }

          if (mode === "open-door" && !selectedDoor) {
               setError("Vui lòng chọn cửa để mở")
               return
          }

          if (!isValidDoorPin(enteredPin)) {
               setError(`Mật khẩu cửa phải gồm đúng ${PIN_LENGTH} chữ số`)
               return
          }

          if (!expectedPassword || !isValidDoorPin(expectedPassword)) {
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

          const nextPin = sanitizePin(text)
          setPin(nextPin)
          if (error) {
               setError("")
          }

          if (nextPin.length === PIN_LENGTH) {
               void handleVerifyPin(nextPin)
          }
     }

     const submitChangePassword = async () => {
          if (!isValidDoorPin(newHousePassword)) {
               Alert.alert("Thông báo", `Mật khẩu nhà phải gồm đúng ${PIN_LENGTH} chữ số`)
               return
          }

          if (newHousePassword !== confirmNewHousePassword) {
               Alert.alert("Thông báo", "Xác nhận mật khẩu chưa khớp")
               return
          }

          try {
               await onChangeHousePassword(newHousePassword)
               setShowChangePasswordModal(false)
               Alert.alert("Thành công", "Đã đổi mật khẩu cửa nhà")
          } catch (changePasswordError) {
               Alert.alert("Lỗi", getApiErrorMessage(changePasswordError, "Không thể đổi mật khẩu lúc này"))
          }
     }

     useEffect(() => {
          if (!modalVisible) {
               return
          }

          const timer = setTimeout(() => inputRef.current?.focus(), 100)
          return () => clearTimeout(timer)
     }, [modalVisible])

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

               <ApartmentModal
                    visible={modalVisible}
                    title={getAuthTitle(mode)}
                    description={getAuthDescription(mode)}
                    onClose={closeModal}
                    onAfterClose={handleAuthModalClosed}
                    liftOnKeyboard
                    keyboardLiftOffset={52}
                    footer={
                         <>
                              <Pressable onPress={closeModal} style={[styles.actionBtn, styles.cancelBtn]}>
                                   <Text style={styles.cancelText}>Hủy</Text>
                              </Pressable>
                              <Pressable
                                   onPress={() => void handleVerifyPin(pin)}
                                   disabled={
                                        lockedSeconds > 0 ||
                                        isDoorPasswordLoading ||
                                        (mode === "open-door" && isOpeningDoor) ||
                                        pin.length !== PIN_LENGTH
                                   }
                                   style={[styles.actionBtn, styles.confirmBtn]}
                              >
                                   {mode === "open-door" && (isOpeningDoor || isAuthenticating) ? (
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
                                   const isSelected = item.id === selectedDoor?.id
                                   return (
                                        <Pressable
                                             key={item.id}
                                             onPress={() => setSelectedDoorId(item.id)}
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
                         {Array.from({ length: PIN_LENGTH }).map((_, index) => (
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
                         onChangeText={onPinChange}
                         keyboardType="number-pad"
                         maxLength={PIN_LENGTH}
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

               <DoorChangePasswordModal
                    visible={showChangePasswordModal}
                    value={newHousePassword}
                    confirmValue={confirmNewHousePassword}
                    isUpdating={isChangingHousePassword}
                    passwordLength={PIN_LENGTH}
                    onChangeValue={(value) => setNewHousePassword(sanitizePin(value))}
                    onChangeConfirmValue={(value) => setConfirmNewHousePassword(sanitizePin(value))}
                    onClose={() => {
                         if (!isChangingHousePassword) {
                              setShowChangePasswordModal(false)
                         }
                    }}
                    onAfterClose={() => {
                         setNewHousePassword("")
                         setConfirmNewHousePassword("")
                    }}
                    onSubmit={() => {
                         void submitChangePassword()
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
     confirmText: {
          color: "#ffffff",
          fontWeight: "700",
     },
     cancelText: {
          color: "#0f172a",
          fontWeight: "600",
     },
})