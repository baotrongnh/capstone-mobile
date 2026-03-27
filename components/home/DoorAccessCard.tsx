import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import {
     Alert,
     Modal,
     Pressable,
     StyleSheet,
     Text,
     TextInput,
     View,
} from "react-native"

interface DoorAccessCardProps {
     title?: string
     password: string
     onOpenDoor?: () => void
}

export default function DoorAccessCard({
     title = "Mở cửa chính",
     password,
     onOpenDoor,
}: DoorAccessCardProps) {
     const [modalVisible, setModalVisible] = useState(false)
     const [inputPassword, setInputPassword] = useState("")
     const [error, setError] = useState("")
     const inputRef = useRef<TextInput>(null)

     const openPasswordModal = () => {
          setError("")
          setInputPassword("")
          setModalVisible(true)
     }

     const closePasswordModal = () => {
          setModalVisible(false)
          setInputPassword("")
          setError("")
     }

     const handleConfirmOpenDoor = (pin: string) => {
          if (pin !== password) {
               setError("Mật khẩu không đúng")
               setTimeout(() => {
                    setInputPassword("")
                    inputRef.current?.focus()
               }, 120)
               return
          }

          closePasswordModal()
          onOpenDoor?.()
          Alert.alert("Thành công", "Cửa đã được mở")
     }

     useEffect(() => {
          if (!modalVisible) return

          const timer = setTimeout(() => {
               inputRef.current?.focus()
          }, 80)

          return () => clearTimeout(timer)
     }, [modalVisible])

     return (
          <>
               <View style={styles.card}>
                    <View style={styles.row}>
                         <View style={styles.icon}>
                              <MaterialCommunityIcons name="door-closed-lock" size={30} color="#1f2937" />
                         </View>
                         <Pressable onPress={openPasswordModal} style={styles.switchButton} hitSlop={10}>
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
                    onRequestClose={closePasswordModal}
               >
                    <View style={styles.overlay}>
                         <View style={styles.modalCard}>
                              <Text style={styles.modalTitle}>Xác thực mở cửa</Text>
                              <Text style={styles.modalDescription}>Nhập mã PIN 6 số, hệ thống tự mở khi đúng</Text>

                              <Pressable style={styles.pinRow} onPress={() => inputRef.current?.focus()}>
                                   {[0, 1, 2, 3, 4, 5].map((index) => {
                                        const value = inputPassword[index]

                                        return (
                                             <View
                                                  key={index}
                                                  style={[
                                                       styles.pinBox,
                                                       value ? styles.pinBoxFilled : undefined,
                                                       error ? styles.pinBoxError : undefined,
                                                  ]}
                                             >
                                                  <Text style={styles.pinText}>{value ? "*" : ""}</Text>
                                             </View>
                                        )
                                   })}
                              </Pressable>

                              <TextInput
                                   ref={inputRef}
                                   value={inputPassword}
                                   onChangeText={(value) => {
                                        const numericOnly = value.replace(/\D/g, "").slice(0, 6)
                                        setInputPassword(numericOnly)
                                        if (error) setError("")
                                        if (numericOnly.length === 6) {
                                             handleConfirmOpenDoor(numericOnly)
                                        }
                                   }}
                                   keyboardType="number-pad"
                                   maxLength={6}
                                   style={styles.hiddenInput}
                                   caretHidden
                              />

                              {error ? <Text style={styles.errorText}>{error}</Text> : null}

                              <View style={styles.actions}>
                                   <Pressable onPress={closePasswordModal} style={[styles.actionBtn, styles.cancelBtn]}>
                                        <Text style={styles.cancelText}>Huỷ</Text>
                                   </Pressable>
                              </View>
                         </View>
                    </View>
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