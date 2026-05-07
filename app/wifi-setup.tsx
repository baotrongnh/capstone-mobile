import { Colors } from "@/components/styles"
import { wifiService } from "@/lib/services/wifi.service"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
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

const DEVICE_WIFI = "HOME-IQ-HUB"
const CHECK_TIMEOUT_MS = 2500
const CHECK_INTERVAL_MS = 3000
const POLL_DELAY_MS = 2000
const POLL_LIMIT = 10

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
type DeviceWifiStatus = "checking" | "ready" | "missing"

export default function WifiSetupScreen() {
  const router = useRouter()
  const [ssid, setSsid] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [deviceWifi, setDeviceWifi] = useState<DeviceWifiStatus>("checking")
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState(`Đang tìm Wi-Fi ${DEVICE_WIFI}...`)
  const [showSuccess, setShowSuccess] = useState(false)

  const isDeviceWifiReady = deviceWifi === "ready"
  const canSend = isDeviceWifiReady && ssid.trim().length > 0 && !isSending
  const deviceWifiText =
    deviceWifi === "checking"
      ? "Đang kiểm tra Wi-Fi thiết bị..."
      : isDeviceWifiReady
        ? `Đã kết nối ${DEVICE_WIFI}`
        : `Chưa kết nối ${DEVICE_WIFI}`

  useEffect(() => {
    if (isSending) {
      return
    }

    let active = true

    const checkDeviceWifi = async () => {
      const result = await wifiService.checkDeviceReadiness(CHECK_TIMEOUT_MS)

      if (!active) {
        return
      }

      setDeviceWifi(result.reachable ? "ready" : "missing")
      setMessage(
        result.reachable
          ? `Đã kết nối Wi-Fi ${DEVICE_WIFI}. Nhập Wi-Fi nhà để gửi cho thiết bị.`
          : `Chưa kết nối ${DEVICE_WIFI}. Hãy vào cài đặt Wi-Fi và chọn mạng này.`,
      )
    }

    void checkDeviceWifi()
    const timer = setInterval(() => void checkDeviceWifi(), CHECK_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [isSending])

  const waitUntilConnected = async () => {
    for (let attempt = 0; attempt < POLL_LIMIT; attempt += 1) {
      await sleep(POLL_DELAY_MS)

      try {
        const result = await wifiService.getStatus()
        if (result.status === "connected") {
          setShowSuccess(true)
          return
        }

        if (result.status === "failed") {
          setMessage("Cấu hình chưa thành công. Kiểm tra lại tên Wi-Fi và mật khẩu.")
          return
        }
      } catch {
        continue
      }
    }

    setMessage("Chưa nhận được xác nhận thành công. Bạn có thể kiểm tra lại Wi-Fi và gửi lại.")
  }

  const sendWifi = async () => {
    Keyboard.dismiss()

    if (!ssid.trim()) {
      setMessage("Vui lòng nhập tên Wi-Fi.")
      return
    }

    if (!isDeviceWifiReady) {
      setMessage(`Chưa kết nối ${DEVICE_WIFI}. Không thể gửi cấu hình.`)
      return
    }

    setIsSending(true)
    setMessage("Đang gửi cấu hình Wi-Fi...")

    try {
      const result = await wifiService.sendConfig({ ssid: ssid.trim(), password })
      if (result.status === "connected") {
        setShowSuccess(true)
      } else if (result.status === "failed") {
        setMessage("Thiết bị từ chối cấu hình. Kiểm tra lại tên Wi-Fi và mật khẩu.")
      } else {
        setMessage("Đã gửi cấu hình. Nếu thành công, app sẽ hiện thông báo.")
        await waitUntilConnected()
      }
    } catch {
      setMessage("Không gửi được cấu hình. Hãy kiểm tra lại kết nối Wi-Fi thiết bị.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#334155" />
            </Pressable>
            <View>
              <Text style={styles.title}>Cài đặt Wi-Fi</Text>
            </View>
          </View>

          <View style={styles.statusBox}>
            <View style={[styles.dot, { backgroundColor: isDeviceWifiReady ? "#16a34a" : "#d97706" }]} />
            <Text style={styles.statusText}>{deviceWifiText}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Tên Wi-Fi nhà</Text>
            <TextInput
              value={ssid}
              onChangeText={setSsid}
              placeholder="Ví dụ: Home_Wifi"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu Wi-Fi"
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.showButton}>
                <Text style={styles.showText}>{showPassword ? "Ẩn" : "Hiện"}</Text>
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={() => void sendWifi()}
              disabled={!canSend}
              style={[styles.button, !canSend && styles.disabled]}
            >
              {isSending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Gửi cấu hình</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>{message}</Text>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={54} color="#16a34a" />
            <Text style={styles.modalTitle}>Thiết bị đã kết nối Wi-Fi</Text>
            <Text style={styles.modalText}>Cấu hình Wi-Fi đã hoàn tất.</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)} style={styles.modalButton}>
              <Text style={styles.buttonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingTop: 56,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  subTitle: {
    color: "#64748b",
    marginTop: 3,
  },
  statusBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: "#334155",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#0f172a",
  },
  passwordWrap: {
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 64,
  },
  showButton: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  showText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  disabled: {
    opacity: 0.55,
  },
  message: {
    color: "#475569",
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  modalText: {
    color: "#64748b",
    textAlign: "center",
  },
  modalButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
})
