import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import {
     Alert,
     KeyboardAvoidingView,
     Modal,
     Platform,
     Pressable,
     StyleSheet,
     Text,
     TextInput,
     View,
} from "react-native"

interface DoorAccessCardProps {
     title?: string
     // TODO: Nhận password từ API thay vì hardcode
     onOpenDoor?: () => void
}

export default function DoorAccessCard({
     title = "Mở cửa chính",
     onOpenDoor,
}: DoorAccessCardProps) {
     const [modalVisible, setModalVisible] = useState(false)
     const [pin, setPin] = useState("")
     const [error, setError] = useState("")
     const inputRef = useRef<TextInput>(null)

     // TODO: Thay bằng gọi API verify PIN
     const CORRECT_PIN = "123456"

     const openModal = () => {
          setError("")
          setPin("")
          setModalVisible(true)
     }

     const closeModal = () => {
          setModalVisible(false)
          setPin("")
          setError("")
     }

     const handleVerifyPin = (enteredPin: string) => {
          if (enteredPin !== CORRECT_PIN) {
               setError("PIN không đúng")
               setPin("")
               inputRef.current?.focus()
               return
          }

          // TODO: Gọi API mở cửa ở đây
          closeModal()
          if (onOpenDoor) onOpenDoor()
          Alert.alert("Thành công", "Cửa đã được mở")
     }

     useEffect(() => {
          if (modalVisible) {
               setTimeout(() => inputRef.current?.focus(), 100)
          }
     }, [modalVisible])

     return (
          <>
               <View style={styles.card}>
                    <View style={styles.row}>
                         <View style={styles.icon}>
                              <MaterialCommunityIcons name="door-closed-lock" size={30} color="#1f2937" />
                         </View>
                         <Pressable onPress={openModal} style={styles.switchButton} hitSlop={10}>
                              <MaterialCommunityIcons name="power" size={24} color="#fff" />
                         </Pressable>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.caption}>Nhấn nút để mở khoá cửa</Text>
               </View>

               <Modal
                    visible={modalVisible}
                    animationType="fade"
                    transparent
                    onRequestClose={closeModal}
               >
                    <KeyboardAvoidingView
                         behavior={Platform.OS === "ios" ? "padding" : "height"}
                         style={styles.overlay}
                    >
                         <View style={styles.modalCard}>
                              <Text style={styles.modalTitle}>Xác thực mở cửa</Text>
                              <Text style={styles.modalDescription}>Nhập PIN 6 số</Text>

                              {/* Hiển thị 6 ô PIN */}
                              <Pressable style={styles.pinRow} onPress={() => inputRef.current?.focus()}>
                                   {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <View
                                             key={i}
                                             style={[
                                                  styles.pinBox,
                                                  pin[i] ? styles.pinBoxFilled : undefined,
                                                  error ? styles.pinBoxError : undefined,
                                             ]}
                                        >
                                             <Text style={styles.pinText}>{pin[i] ? "*" : ""}</Text>
                                        </View>
                                   ))}
                              </Pressable>

                              {/* Input ẩn để nhân bàn phím */}
                              <TextInput
                                   ref={inputRef}
                                   value={pin}
                                   onChangeText={(text) => {
                                        const digits = text.replace(/\D/g, "").slice(0, 6)
                                        setPin(digits)
                                        setError("")
                                        if (digits.length === 6) {
                                             handleVerifyPin(digits)
                                        }
                                   }}
                                   keyboardType="number-pad"
                                   maxLength={6}
                                   style={styles.hiddenInput}
                              />

                              {/* Hiển thị lỗi */}
                              {error ? <Text style={styles.errorText}>{error}</Text> : null}

                              {/* Nút đóng */}
                              <View style={styles.actions}>
                                   <Pressable onPress={closeModal} style={[styles.actionBtn, styles.cancelBtn]}>
                                        <Text style={styles.cancelText}>Huỷ</Text>
                                   </Pressable>
                              </View>
                         </View>
                    </KeyboardAvoidingView>
               </Modal>
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
     overlay: {
          flex: 1,
          backgroundColor: "rgba(15,23,42,0.45)",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
     },
     modalCard: {
          width: "100%",
          maxWidth: 380,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 20,
     },
     modalTitle: {
          fontSize: 20,
          fontWeight: "700",
          color: "#111827",
          marginBottom: 8,
     },
     modalDescription: {
          fontSize: 14,
          color: "#475569",
          marginBottom: 16,
     },
     pinRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 4,
     },
     pinBox: {
          width: 46,
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#cbd5e1",
          backgroundColor: "#f8fafc",
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
          fontSize: 24,
          fontWeight: "700",
          color: "#0f172a",
     },
     hiddenInput: {
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
     },
     errorText: {
          marginTop: 8,
          color: "#dc2626",
          fontSize: 13,
     },
     actions: {
          marginTop: 18,
          flexDirection: "row",
          justifyContent: "center",
     },
     actionBtn: {
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 20,
          minWidth: 120,
          alignItems: "center",
     },
     cancelBtn: {
          backgroundColor: "#eef2f7",
     },
     cancelText: {
          color: "#0f172a",
          fontWeight: "600",
     },
})