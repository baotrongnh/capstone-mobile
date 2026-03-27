import { Colors } from "@/components/styles"
import { wifiService, WifiStatus } from "@/lib/services/wifi.service"
import { isAxiosError } from "axios"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import {
     ActivityIndicator,
     Keyboard,
     KeyboardAvoidingView,
     Platform,
     Pressable,
     ScrollView,
     StyleSheet,
     Text,
     TextInput,
     TouchableOpacity,
     TouchableWithoutFeedback,
     View,
} from "react-native"

const STATUS_LABEL: Record<WifiStatus, string> = {
     idle: "Sẵn sàng",
     sending: "Đang gửi cấu hình",
     connecting: "Thiết bị đang kết nối Wi-Fi",
     connected: "Kết nối thành công",
     failed: "Kết nối thất bại",
}

const STATUS_COLOR: Record<WifiStatus, string> = {
     idle: "#64748b",
     sending: "#2563eb",
     connecting: "#d97706",
     connected: "#16a34a",
     failed: "#dc2626",
}

export default function WifiSetupScreen() {
     const router = useRouter()
     const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

     const [ssid, setSsid] = useState("")
     const [password, setPassword] = useState("")
     const [showPassword, setShowPassword] = useState(false)
     const [status, setStatus] = useState<WifiStatus>("idle")
     const [debugMessage, setDebugMessage] = useState("")
     const [isCheckingStatus, setIsCheckingStatus] = useState(false)

     const canSubmit = useMemo(() => {
          return ssid.trim().length > 0 && status !== "sending" && status !== "connecting"
     }, [ssid, status])

     useEffect(() => {
          return () => {
               if (pollTimer.current) {
                    clearTimeout(pollTimer.current)
               }
          }
     }, [])

     const schedulePoll = (retry = 0) => {
          pollTimer.current = setTimeout(async () => {
               try {
                    const data = await wifiService.getStatus()

                    if (data.status === "connected") {
                         setStatus("connected")
                         setDebugMessage(JSON.stringify(data, null, 2))
                         return
                    }

                    if (data.status === "failed") {
                         setStatus("failed")
                         setDebugMessage(JSON.stringify(data, null, 2))
                         return
                    }

                    if (retry >= 10) {
                         setStatus("failed")
                         setDebugMessage("Hết thời gian chờ phản hồi từ thiết bị")
                         return
                    }

                    setStatus("connecting")
                    setDebugMessage(JSON.stringify(data, null, 2))
                    schedulePoll(retry + 1)
               } catch (error) {
                    if (retry >= 5) {
                         setStatus("failed")
                         if (isAxiosError(error)) {
                              setDebugMessage(error.message)
                         } else {
                              setDebugMessage("Không thể lấy trạng thái thiết bị")
                         }
                         return
                    }

                    schedulePoll(retry + 1)
               }
          }, 2000)
     }

     const handleSendWifi = async () => {
          Keyboard.dismiss()

          if (!ssid.trim()) {
               setDebugMessage("Vui lòng nhập tên Wi-Fi")
               return
          }

          try {
               setStatus("sending")
               setDebugMessage("")

               const data = await wifiService.sendConfig({
                    ssid: ssid.trim(),
                    password,
               })

               setDebugMessage(JSON.stringify(data, null, 2))

               if (data.status === "connecting") {
                    setStatus("connecting")
                    schedulePoll(0)
                    return
               }

               if (data.status === "connected") {
                    setStatus("connected")
                    return
               }

               setStatus("failed")
          } catch (error) {
               setStatus("failed")
               if (isAxiosError(error)) {
                    setDebugMessage(error.message)
               } else {
                    setDebugMessage("Không gửi được cấu hình Wi-Fi")
               }
          }
     }

     const handleDebugStatus = async () => {
          try {
               setIsCheckingStatus(true)
               const data = await wifiService.getStatus()
               if (data.status === "connected") {
                    setStatus("connected")
               } else if (data.status === "failed") {
                    setStatus("failed")
               } else if (data.status === "connecting") {
                    setStatus("connecting")
               }
               setDebugMessage(JSON.stringify(data, null, 2))
          } catch (error) {
               if (isAxiosError(error)) {
                    setDebugMessage(error.message)
               } else {
                    setDebugMessage("Không thể debug trạng thái")
               }
          } finally {
               setIsCheckingStatus(false)
          }
     }

     return (
          <KeyboardAvoidingView
               style={styles.wrapper}
               behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
               <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                         contentContainerStyle={styles.scrollContent}
                         keyboardShouldPersistTaps="handled"
                         showsVerticalScrollIndicator={false}
                    >
                         <View style={styles.headerRow}>
                              <Text style={styles.title}>Kết nối Wi-Fi cho thiết bị</Text>
                              <TouchableOpacity onPress={() => router.back()}>
                                   <Text style={styles.backButton}>Quay lại</Text>
                              </TouchableOpacity>
                         </View>

                         <Text style={styles.subtitle}>
                              Kết nối điện thoại với Wi-Fi của thiết bị, sau đó nhập mạng Wi-Fi bạn muốn thiết bị sử dụng.
                         </Text>

                         <View style={styles.card}>
                              <Text style={styles.label}>Tên Wi-Fi (SSID)</Text>
                              <TextInput
                                   value={ssid}
                                   onChangeText={setSsid}
                                   placeholder="Ví dụ: Home_Wifi_5G"
                                   style={styles.input}
                                   autoCapitalize="none"
                                   autoCorrect={false}
                                   returnKeyType="next"
                              />

                              <Text style={styles.label}>Mật khẩu Wi-Fi</Text>
                              <View style={styles.passwordWrap}>
                                   <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Nhập mật khẩu"
                                        style={styles.passwordInput}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                   />
                                   <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.togglePasswordBtn}>
                                        <Text style={styles.togglePasswordText}>{showPassword ? "Ẩn" : "Hiện"}</Text>
                                   </Pressable>
                              </View>

                              <TouchableOpacity
                                   onPress={handleSendWifi}
                                   disabled={!canSubmit}
                                   style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
                              >
                                   {status === "sending" || status === "connecting" ? (
                                        <ActivityIndicator color="#ffffff" />
                                   ) : (
                                        <Text style={styles.primaryButtonText}>Gửi cấu hình Wi-Fi</Text>
                                   )}
                              </TouchableOpacity>

                              <TouchableOpacity
                                   onPress={handleDebugStatus}
                                   disabled={isCheckingStatus}
                                   style={[styles.secondaryButton, isCheckingStatus && styles.buttonDisabled]}
                              >
                                   {isCheckingStatus ? (
                                        <ActivityIndicator color={Colors.primary} />
                                   ) : (
                                        <Text style={styles.secondaryButtonText}>Debug trạng thái</Text>
                                   )}
                              </TouchableOpacity>
                         </View>

                         <View style={styles.statusBox}>
                              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
                              <Text style={styles.statusText}>{STATUS_LABEL[status]}</Text>
                         </View>

                         {!!debugMessage && (
                              <View style={styles.debugBox}>
                                   <Text style={styles.debugTitle}>debug: </Text>
                                   <Text style={styles.debugText}>{debugMessage}</Text>
                              </View>
                         )}
                    </ScrollView>
               </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
     )
}

const styles = StyleSheet.create({
     wrapper: {
          flex: 1,
          backgroundColor: "#f8fafc",
     },
     scrollContent: {
          padding: 20,
          paddingTop: 60,
          paddingBottom: 40,
     },
     headerRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
     },
     title: {
          flex: 1,
          fontSize: 24,
          fontWeight: "700",
          color: "#0f172a",
          marginRight: 12,
     },
     backButton: {
          color: Colors.primary,
          fontWeight: "600",
     },
     subtitle: {
          color: "#475569",
          marginBottom: 20,
          lineHeight: 20,
     },
     card: {
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          gap: 10,
     },
     label: {
          fontSize: 13,
          color: "#334155",
          fontWeight: "600",
          marginTop: 4,
     },
     input: {
          height: 50,
          borderWidth: 1,
          borderColor: "#cbd5e1",
          borderRadius: 12,
          paddingHorizontal: 14,
          backgroundColor: "#ffffff",
          color: "#0f172a",
     },
     passwordWrap: {
          position: "relative",
          justifyContent: "center",
     },
     passwordInput: {
          height: 50,
          borderWidth: 1,
          borderColor: "#cbd5e1",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingRight: 54,
          backgroundColor: "#ffffff",
          color: "#0f172a",
     },
     togglePasswordBtn: {
          position: "absolute",
          right: 12,
          top: 14,
     },
     togglePasswordText: {
          color: Colors.primary,
          fontWeight: "600",
     },
     primaryButton: {
          marginTop: 12,
          backgroundColor: Colors.primary,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
     },
     primaryButtonText: {
          color: "#ffffff",
          fontWeight: "700",
          fontSize: 15,
     },
     secondaryButton: {
          marginTop: 6,
          borderRadius: 12,
          paddingVertical: 13,
          alignItems: "center",
          borderWidth: 1,
          borderColor: Colors.primary,
          backgroundColor: "#eff6ff",
     },
     secondaryButtonText: {
          color: Colors.primary,
          fontWeight: "700",
          fontSize: 15,
     },
     buttonDisabled: {
          opacity: 0.6,
     },
     statusBox: {
          marginTop: 16,
          backgroundColor: "#ffffff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     dot: {
          width: 10,
          height: 10,
          borderRadius: 100,
     },
     statusText: {
          color: "#0f172a",
          fontWeight: "600",
     },
     debugBox: {
          marginTop: 16,
          backgroundColor: "#0f172a",
          borderRadius: 14,
          padding: 14,
     },
     debugTitle: {
          color: "#93c5fd",
          fontWeight: "700",
          marginBottom: 8,
     },
     debugText: {
          color: "#e2e8f0",
          fontSize: 12,
          lineHeight: 18,
     },
})
