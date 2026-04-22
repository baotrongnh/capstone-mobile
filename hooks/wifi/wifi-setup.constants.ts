import type { WifiProbeReason, WifiStatus } from "@/lib/services/wifi.service"
import { Platform } from "react-native"

export const REQUIRED_DEVICE_WIFI = "HOME-IQ-HUB"
export const WIFI_DEVICE_URL = "http://192.168.4.1"
export const LOG_PREFIX = "[wifi-setup]"
export const POLL_INTERVAL_MS = 2000
export const POLL_MAX_RETRY = 10
export const POLL_ERROR_RETRY = 5
export const READINESS_TIMEOUT_MS = 2500

const STATUS_META: Record<Exclude<WifiStatus, "idle">, { label: string; color: string }> = {
  sending: { label: "Đang gửi cấu hình", color: "#2563eb" },
  connecting: { label: "Thiết bị đang kết nối Wi-Fi", color: "#d97706" },
  connected: { label: "Kết nối thành công", color: "#16a34a" },
  failed: { label: "Hub của bạn chưa được kết nối vào wifi", color: "#d5d100" },
}

export const WIFI_MESSAGES = {
  requireSsid: "Vui lòng nhập tên Wi-Fi.",
  readyToSend: `Đã kết nối ${REQUIRED_DEVICE_WIFI}. Có thể gửi cấu hình.`,
  sendingConfig: "Đang gửi cấu hình...",
  waitingForDevice: "Cấu hình đã gửi. Đang chờ thiết bị kết nối Wi-Fi...",
  connecting: "Thiết bị đang kết nối Wi-Fi...",
  connected: "Thiết bị đã kết nối Wi-Fi thành công.",
  failed: "Thiết bị kết nối Wi-Fi thất bại. Vui lòng kiểm tra lại thông tin.",
  failedAfterSend: "Thiết bị từ chối cấu hình. Vui lòng thử lại.",
  failedReadiness: "Thiết bị từng kết nối thất bại. Bạn có thể gửi lại cấu hình.",
  pollTimeout: "Hết thời gian chờ phản hồi từ thiết bị.",
  pollError: "Không thể lấy trạng thái thiết bị.",
  sendConfigError: "Không gửi được cấu hình Wi-Fi.",
} as const

const ANDROID_GUIDE =
  "Android/Xiaomi có thể đã vào đúng Wi-Fi nhưng vẫn dùng dữ liệu di động hoặc chặn HTTP nội bộ. Hãy tắt Switch to mobile data, Wi-Fi assistant, Smart network switch rồi thử mở http://192.168.4.1 trong trình duyệt."

export const mapServerStatus = (status?: string | null): WifiStatus => {
  if (status === "connecting" || status === "connected" || status === "failed") {
    return status
  }

  return "idle"
}

export const getReadinessMessage = (status: WifiStatus) => {
  if (status === "connected") {
    return WIFI_MESSAGES.connected
  }

  if (status === "connecting") {
    return WIFI_MESSAGES.connecting
  }

  if (status === "failed") {
    return WIFI_MESSAGES.failedReadiness
  }

  return WIFI_MESSAGES.readyToSend
}

export const getProbeFailureMessage = (reason?: WifiProbeReason) => {
  const prefix = `Không thể xác nhận kết nối tới ${REQUIRED_DEVICE_WIFI}.`

  if (reason === "timeout") {
    return `${prefix} Thiết bị không phản hồi từ ${WIFI_DEVICE_URL}. ${Platform.OS === "android" ? ANDROID_GUIDE : "Hãy kiểm tra lại Wi-Fi của thiết bị."}`
  }

  if (reason === "http_blocked") {
    return `${prefix} Android đang chặn HTTP nội bộ tới ${WIFI_DEVICE_URL}. Kiểm tra bản build đã cho phép cleartext và thử mở địa chỉ này trong trình duyệt.`
  }

  if (reason === "network_unavailable") {
    return `${prefix} ${Platform.OS === "android" ? ANDROID_GUIDE : `Hãy kết nối lại Wi-Fi ${REQUIRED_DEVICE_WIFI} rồi thử lại.`}`
  }

  return `${prefix} Hãy kết nối lại ${REQUIRED_DEVICE_WIFI} và thử mở ${WIFI_DEVICE_URL} trong trình duyệt để kiểm tra.`
}

export const getStatusDisplay = (
  isCheckingNetwork: boolean,
  isOnDeviceNetwork: boolean | null,
  status: WifiStatus,
) => {
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

  return STATUS_META[status]
}
