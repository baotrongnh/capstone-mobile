import { Colors } from "@/components/styles"
import { Ionicons } from "@expo/vector-icons"
import { wifiService, WifiStatus } from "@/lib/services/wifi.service"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
     ActivityIndicator,
     Keyboard,
     KeyboardAvoidingView,
     Modal,
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

const REQUIRED_DEVICE_WIFI = "HOME-IQ-HUB"
const LOG_PREFIX = "[wifi-setup]"
const POLL_INTERVAL_MS = 2000
const POLL_MAX_RETRY = 10
const POLL_ERROR_RETRY = 5
const READINESS_TIMEOUT_MS = 2500

const STATUS_META: Record<Exclude<WifiStatus, "idle">, { label: string; color: string }> = {
     sending: { label: "Đang gửi cấu hình", color: "#2563eb" },
     connecting: { label: "Thiết bị đang kết nối Wi-Fi", color: "#d97706" },
     connected: { label: "Kết nối thành công", color: "#16a34a" },
     failed: { label: "Kết nối thất bại", color: "#dc2626" },
}

const mapServerStatus = (status?: string | null): WifiStatus => {
     if (status === "connecting" || status === "connected" || status === "failed") {
          return status
     }
     return "idle"
}

export default function WifiSetupScreen() {
     const router = useRouter()
     const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

     const [ssid, setSsid] = useState("")
     const [password, setPassword] = useState("")
     const [showPassword, setShowPassword] = useState(false)
     const [status, setStatus] = useState<WifiStatus>("idle")
     const [message, setMessage] = useState("")
     const [isCheckingNetwork, setIsCheckingNetwork] = useState(false)
     const [isOnDeviceNetwork, setIsOnDeviceNetwork] = useState<boolean | null>(null)
     const [isGuideOpen, setIsGuideOpen] = useState(false)

     const logDebug = useCallback((event: string, payload?: unknown) => {
          console.log(LOG_PREFIX, event, payload ?? "")
     }, [])

     const isBusy = isCheckingNetwork || status === "sending" || status === "connecting"
     const trimmedSsid = ssid.trim()

     const canSubmit = useMemo(() => trimmedSsid.length > 0 && isOnDeviceNetwork === true && !isBusy, [isBusy, isOnDeviceNetwork, trimmedSsid.length])

     const statusDisplay = useMemo(() => {
          if (isCheckingNetwork) {
               return { label: "Đang kiểm tra mạng thiết bị", color: "#2563eb" }
          }

          if (status === "idle") {
               if (isOnDeviceNetwork === true) {
                    return { label: "Sẵn sàng gửi cấu hình", color: "#16a34a" }
               }
               if (isOnDeviceNetwork === false) {
                    return { label: `Chưa kết nối ${REQUIRED_DEVICE_WIFI}`, color: "#d97706" }
               }
               return { label: "Đang kiểm tra kết nối", color: "#64748b" }
          }

          return {
               label: STATUS_META[status].label,
               color: STATUS_META[status].color,
          }
     }, [isCheckingNetwork, isOnDeviceNetwork, status])

     const checkDeviceNetwork = useCallback(async (silent = false) => {
          setIsCheckingNetwork(true)
          try {
               const readiness = await wifiService.checkDeviceReadiness(READINESS_TIMEOUT_MS)
               logDebug("device-network-check", readiness)
               setIsOnDeviceNetwork(readiness.reachable)

               if (!readiness.reachable) {
                    setStatus("idle")
                    if (!silent) {
                         setMessage(`Vui lòng kết nối ${REQUIRED_DEVICE_WIFI} trước khi gửi cấu hình.`)
                    }
                    return false
               }

               const serverStatus = mapServerStatus(readiness.status)
               setStatus(serverStatus)

               if (!silent) {
                    if (serverStatus === "connected") {
                         setMessage("Thiết bị đã kết nối Wi-Fi thành công.")
                    } else if (serverStatus === "connecting") {
                         setMessage("Thiết bị đang kết nối Wi-Fi...")
                    } else if (serverStatus === "failed") {
                         setMessage("Thiết bị từng kết nối thất bại. Bạn có thể gửi lại cấu hình.")
                    } else {
                         setMessage(`Đã kết nối ${REQUIRED_DEVICE_WIFI}. Có thể gửi cấu hình.`)
                    }
               }

               return true
          } finally {
               setIsCheckingNetwork(false)
          }
     }, [logDebug])

     useEffect(() => {
          return () => {
               if (pollTimer.current) {
                    clearTimeout(pollTimer.current)
               }
          }
     }, [])

     useEffect(() => {
          void checkDeviceNetwork(true)
     }, [checkDeviceNetwork])

     const schedulePoll = useCallback((retry = 0) => {
          pollTimer.current = setTimeout(async () => {
               try {
                    const data = await wifiService.getStatus()
                    const nextStatus = mapServerStatus(data.status)
                    logDebug("poll-status", { retry, status: nextStatus })

                    if (nextStatus === "connected") {
                         setStatus(nextStatus)
                         setMessage("Thiết bị đã kết nối Wi-Fi thành công.")
                         return
                    }

                    if (nextStatus === "failed") {
                         setStatus(nextStatus)
                         setMessage("Thiết bị kết nối Wi-Fi thất bại. Vui lòng kiểm tra lại thông tin.")
                         return
                    }

                    if (retry >= POLL_MAX_RETRY) {
                         setStatus("failed")
                         setMessage("Hết thời gian chờ phản hồi từ thiết bị")
                         return
                    }

                    setStatus("connecting")
                    setMessage("Thiết bị đang kết nối Wi-Fi...")
                    schedulePoll(retry + 1)
               } catch (error) {
                    logDebug("poll-status-error", { retry, error })
                    if (retry >= POLL_ERROR_RETRY) {
                         setStatus("failed")
                         setMessage("Không thể lấy trạng thái thiết bị")
                         return
                    }

                    schedulePoll(retry + 1)
               }
          }, POLL_INTERVAL_MS)
     }, [logDebug])

     const handleSendWifi = async () => {
          Keyboard.dismiss()

          if (!trimmedSsid) {
               setMessage("Vui lòng nhập tên Wi-Fi")
               return
          }

          if (pollTimer.current) {
               clearTimeout(pollTimer.current)
          }

          const isReady = await checkDeviceNetwork()
          if (!isReady) {
               setStatus("idle")
               return
          }

          try {
               setStatus("sending")
               setMessage("Đang gửi cấu hình...")
               logDebug("send-config", { ssid: trimmedSsid })

               const data = await wifiService.sendConfig({
                    ssid: trimmedSsid,
                    password,
               })
               logDebug("send-config-result", data)

               const nextStatus = mapServerStatus(data.status)

               if (nextStatus === "connected") {
                    setStatus(nextStatus)
                    setMessage("Thiết bị đã kết nối Wi-Fi thành công.")
                    return
               }

               if (nextStatus === "failed") {
                    setStatus(nextStatus)
                    setMessage("Thiết bị từ chối cấu hình. Vui lòng thử lại.")
                    return
               }

               setStatus("connecting")
               setMessage("Cấu hình đã gửi. Đang chờ thiết bị kết nối Wi-Fi...")
               schedulePoll(0)
          } catch (error) {
               logDebug("send-config-error", error)
               setStatus("failed")
               setMessage("Không gửi được cấu hình Wi-Fi")
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
                         <View style={styles.header}>
                              <View style={styles.headerTop}>
                                   <Pressable onPress={() => router.back()} style={styles.backButton}>
                                        <Ionicons name="chevron-back" size={24} color="#334155" />
                                   </Pressable>
                                   <Text style={styles.title}>Wi-Fi Setup</Text>
                              </View>

                              <View style={styles.headerBottom}>
                                   <TouchableOpacity onPress={() => setIsGuideOpen(true)} style={styles.guideButton}>
                                        <Text style={styles.guideText}>Hướng dẫn</Text>
                                   </TouchableOpacity>
                              </View>
                         </View>

                         <Text style={styles.subtitle}>
                              Kết nối điện thoại với Wi-Fi của thiết bị, sau đó nhập mạng Wi-Fi bạn muốn thiết bị sử dụng.
                         </Text>

                         <View style={styles.card}>
                              <View style={[styles.networkBox, isOnDeviceNetwork ? styles.networkBoxOk : styles.networkBoxWarn]}>
                                   <View style={styles.networkHead}>
                                        <Text style={styles.networkTitle}>Mạng thiết bị</Text>
                                        <View style={[styles.networkPill, isOnDeviceNetwork ? styles.networkPillOk : styles.networkPillWarn]}>
                                             <Text style={[styles.networkPillText, isOnDeviceNetwork ? styles.networkPillTextOk : styles.networkPillTextWarn]}>
                                                  {isOnDeviceNetwork ? "Sẵn sàng" : "Chưa sẵn sàng"}
                                             </Text>
                                        </View>
                                   </View>

                                   <Text style={styles.networkText}>
                                        {isOnDeviceNetwork === null
                                             ? "Đang kiểm tra kết nối..."
                                             : isOnDeviceNetwork
                                                  ? `Đang kết nối ${REQUIRED_DEVICE_WIFI}`
                                                  : `Chưa kết nối ${REQUIRED_DEVICE_WIFI}`}
                                   </Text>
                              </View>

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
                                   {isBusy ? (
                                        <ActivityIndicator color="#ffffff" />
                                   ) : (
                                        <Text style={styles.primaryButtonText}>Gửi cấu hình Wi-Fi</Text>
                                   )}
                              </TouchableOpacity>

                              <TouchableOpacity
                                   onPress={() => {
                                        void checkDeviceNetwork()
                                   }}
                                   disabled={isCheckingNetwork}
                                   style={[styles.secondaryButton, isCheckingNetwork && styles.buttonDisabled]}
                              >
                                   {isCheckingNetwork ? (
                                        <ActivityIndicator color={Colors.primary} />
                                   ) : (
                                        <Text style={styles.secondaryButtonText}>Kiểm tra {REQUIRED_DEVICE_WIFI}</Text>
                                   )}
                              </TouchableOpacity>

                              <Text style={styles.helperText}>Thiết bị chỉ nhận cấu hình khi điện thoại đang ở mạng {REQUIRED_DEVICE_WIFI}.</Text>
                         </View>

                         <View style={styles.statusBox}>
                              <View style={[styles.dot, { backgroundColor: statusDisplay.color }]} />
                              <Text style={[styles.statusText, { color: statusDisplay.color }]}>{statusDisplay.label}</Text>
                         </View>

                         {!!message && (
                              <View style={styles.messageBox}>
                                   <Text style={styles.messageText}>{message}</Text>
                              </View>
                         )}
                    </ScrollView>
               </TouchableWithoutFeedback>

               <Modal
                    visible={isGuideOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsGuideOpen(false)}
               >
                    <View style={styles.modalOverlay}>
                         <View style={styles.modalCard}>
                              <Text style={styles.modalTitle}>Hướng dẫn nhanh</Text>
                              <Text style={styles.modalStep}>1. Mở cài đặt Wi-Fi điện thoại và kết nối mạng {REQUIRED_DEVICE_WIFI}.</Text>
                              <Text style={styles.modalStep}>2. Quay lại màn hình này, nhập tên và mật khẩu Wi-Fi nhà của bạn.</Text>
                              <Text style={styles.modalStep}>3. Bấm Gửi cấu hình Wi-Fi để thiết bị tự kết nối mạng nhà.</Text>

                              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsGuideOpen(false)}>
                                   <Text style={styles.modalCloseText}>Đã hiểu</Text>
                              </TouchableOpacity>
                         </View>
                    </View>
               </Modal>
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
          paddingTop: 36,
          paddingBottom: 40,
     },
     header: {
          marginTop: 20,
          marginBottom: 10,
          gap: 8,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
     },
     headerTop: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     backButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
     },
     title: {
          fontSize: 22,
          fontWeight: "700",
          color: "#0f172a",
     },
     headerBottom: {
          alignItems: "flex-end",
     },
     guideButton: {
          borderRadius: 999,
          // borderWidth: 1,
          // borderColor: "#bfdbfe",
          // backgroundColor: "#eff6ff",
          paddingHorizontal: 12,
          paddingVertical: 6,
     },
     guideText: {
          color: Colors.primary,
          fontWeight: "600",
     },
     subtitle: {
          color: "#475569",
          marginBottom: 16,
          lineHeight: 20,
     },
     card: {
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          gap: 12,
          shadowColor: "#0f172a",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: {
               width: 0,
               height: 6,
          },
          elevation: 2,
     },
     networkBox: {
          borderRadius: 12,
          borderWidth: 1,
          padding: 12,
          marginBottom: 2,
          gap: 8,
     },
     networkBoxOk: {
          borderColor: "#86efac",
          backgroundColor: "#f0fdf4",
     },
     networkBoxWarn: {
          borderColor: "#fed7aa",
          backgroundColor: "#fff7ed",
     },
     networkTitle: {
          color: "#334155",
          fontSize: 12,
          fontWeight: "700",
     },
     networkHead: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
     },
     networkPill: {
          borderRadius: 99,
          paddingHorizontal: 10,
          paddingVertical: 4,
     },
     networkPillOk: {
          backgroundColor: "#dcfce7",
     },
     networkPillWarn: {
          backgroundColor: "#ffedd5",
     },
     networkPillText: {
          fontSize: 11,
          fontWeight: "700",
     },
     networkPillTextOk: {
          color: "#15803d",
     },
     networkPillTextWarn: {
          color: "#b45309",
     },
     networkText: {
          color: "#0f172a",
          fontWeight: "600",
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
     helperText: {
          color: "#64748b",
          fontSize: 12,
          lineHeight: 18,
          marginTop: 2,
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
          fontWeight: "600",
     },
     messageBox: {
          marginTop: 16,
          backgroundColor: "#ffffff",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
     },
     messageText: {
          color: "#334155",
          fontSize: 13,
          lineHeight: 18,
     },
     modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(15,23,42,0.45)",
          justifyContent: "center",
          padding: 20,
     },
     modalCard: {
          backgroundColor: "#ffffff",
          borderRadius: 18,
          padding: 18,
          gap: 10,
     },
     modalTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: "#0f172a",
     },
     modalStep: {
          color: "#334155",
          lineHeight: 20,
     },
     modalCloseButton: {
          marginTop: 4,
          backgroundColor: Colors.primary,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: "center",
     },
     modalCloseText: {
          color: "#ffffff",
          fontWeight: "700",
     },
})
