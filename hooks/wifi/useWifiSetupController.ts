import { wifiService, type WifiStatus } from "@/lib/services/wifi.service"
import { Keyboard } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

const WIFI_MESSAGES = {
  requireSsid: "Vui lòng nhập tên Wi-Fi",
  requireDeviceWifi: `Vui lòng kết nối ${REQUIRED_DEVICE_WIFI} trước khi gửi cấu hình.`,
  readyToSend: `Đã kết nối ${REQUIRED_DEVICE_WIFI}. Có thể gửi cấu hình.`,
  sendingConfig: "Đang gửi cấu hình...",
  waitingForDevice: "Cấu hình đã gửi. Đang chờ thiết bị kết nối Wi-Fi...",
  connecting: "Thiết bị đang kết nối Wi-Fi...",
  connected: "Thiết bị đã kết nối Wi-Fi thành công.",
  failed: "Thiết bị kết nối Wi-Fi thất bại. Vui lòng kiểm tra lại thông tin.",
  failedAfterSend: "Thiết bị từ chối cấu hình. Vui lòng thử lại.",
  failedReadiness: "Thiết bị từng kết nối thất bại. Bạn có thể gửi lại cấu hình.",
  pollTimeout: "Hết thời gian chờ phản hồi từ thiết bị",
  pollError: "Không thể lấy trạng thái thiết bị",
  sendConfigError: "Không gửi được cấu hình Wi-Fi",
} as const

const mapServerStatus = (status?: string | null): WifiStatus => {
  if (status === "connecting" || status === "connected" || status === "failed") {
    return status
  }

  return "idle"
}

const getReadinessMessage = (status: WifiStatus) => {
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

const getStatusDisplay = (
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

  return {
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
  }
}

export function useWifiSetupController() {
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

  const clearPollTimer = useCallback(() => {
    if (!pollTimer.current) {
      return
    }

    clearTimeout(pollTimer.current)
    pollTimer.current = null
  }, [])

  const isBusy = isCheckingNetwork || status === "sending" || status === "connecting"
  const trimmedSsid = ssid.trim()
  const canSubmit = Boolean(trimmedSsid) && isOnDeviceNetwork === true && !isBusy

  const statusDisplay = useMemo(
    () => getStatusDisplay(isCheckingNetwork, isOnDeviceNetwork, status),
    [isCheckingNetwork, isOnDeviceNetwork, status],
  )

  const checkDeviceNetwork = useCallback(
    async (silent = false) => {
      setIsCheckingNetwork(true)
      try {
        const readiness = await wifiService.checkDeviceReadiness(READINESS_TIMEOUT_MS)
        logDebug("device-network-check", readiness)
        setIsOnDeviceNetwork(readiness.reachable)

        if (!readiness.reachable) {
          setStatus("idle")
          if (!silent) {
            setMessage(WIFI_MESSAGES.requireDeviceWifi)
          }
          return false
        }

        const serverStatus = mapServerStatus(readiness.status)
        setStatus(serverStatus)

        if (!silent) {
          setMessage(getReadinessMessage(serverStatus))
        }

        return true
      } catch (error) {
        logDebug("device-network-check-error", error)
        setIsOnDeviceNetwork(false)
        setStatus("idle")
        if (!silent) {
          setMessage(WIFI_MESSAGES.requireDeviceWifi)
        }
        return false
      } finally {
        setIsCheckingNetwork(false)
      }
    },
    [logDebug],
  )

  const schedulePoll = useCallback(
    (retry = 0) => {
      clearPollTimer()

      pollTimer.current = setTimeout(async () => {
        try {
          const data = await wifiService.getStatus()
          const nextStatus = mapServerStatus(data.status)
          logDebug("poll-status", { retry, status: nextStatus })

          if (nextStatus === "connected") {
            setStatus(nextStatus)
            setMessage(WIFI_MESSAGES.connected)
            return
          }

          if (nextStatus === "failed") {
            setStatus(nextStatus)
            setMessage(WIFI_MESSAGES.failed)
            return
          }

          if (retry >= POLL_MAX_RETRY) {
            setStatus("failed")
            setMessage(WIFI_MESSAGES.pollTimeout)
            return
          }

          setStatus("connecting")
          setMessage(WIFI_MESSAGES.connecting)
          schedulePoll(retry + 1)
        } catch (error) {
          logDebug("poll-status-error", { retry, error })
          if (retry >= POLL_ERROR_RETRY) {
            setStatus("failed")
            setMessage(WIFI_MESSAGES.pollError)
            return
          }

          schedulePoll(retry + 1)
        }
      }, POLL_INTERVAL_MS)
    },
    [clearPollTimer, logDebug],
  )

  const handleCheckNetwork = useCallback(() => {
    void checkDeviceNetwork()
  }, [checkDeviceNetwork])

  const handleSendWifi = useCallback(async () => {
    Keyboard.dismiss()

    if (!trimmedSsid) {
      setMessage(WIFI_MESSAGES.requireSsid)
      return
    }

    clearPollTimer()

    const isReady = await checkDeviceNetwork()
    if (!isReady) {
      return
    }

    try {
      setStatus("sending")
      setMessage(WIFI_MESSAGES.sendingConfig)
      logDebug("send-config", { ssid: trimmedSsid })

      const data = await wifiService.sendConfig({
        ssid: trimmedSsid,
        password,
      })
      logDebug("send-config-result", data)

      const nextStatus = mapServerStatus(data.status)

      if (nextStatus === "connected") {
        setStatus(nextStatus)
        setMessage(WIFI_MESSAGES.connected)
        return
      }

      if (nextStatus === "failed") {
        setStatus(nextStatus)
        setMessage(WIFI_MESSAGES.failedAfterSend)
        return
      }

      setStatus("connecting")
      setMessage(WIFI_MESSAGES.waitingForDevice)
      schedulePoll(0)
    } catch (error) {
      logDebug("send-config-error", error)
      setStatus("failed")
      setMessage(WIFI_MESSAGES.sendConfigError)
    }
  }, [checkDeviceNetwork, clearPollTimer, logDebug, password, schedulePoll, trimmedSsid])

  useEffect(() => {
    return clearPollTimer
  }, [clearPollTimer])

  useEffect(() => {
    void checkDeviceNetwork(true)
  }, [checkDeviceNetwork])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const openGuide = useCallback(() => {
    setIsGuideOpen(true)
  }, [])

  const closeGuide = useCallback(() => {
    setIsGuideOpen(false)
  }, [])

  return {
    requiredDeviceWifi: REQUIRED_DEVICE_WIFI,
    ssid,
    setSsid,
    password,
    setPassword,
    showPassword,
    togglePassword,
    status,
    message,
    isCheckingNetwork,
    isOnDeviceNetwork,
    isGuideOpen,
    openGuide,
    closeGuide,
    isBusy,
    canSubmit,
    statusDisplay,
    handleCheckNetwork,
    handleSendWifi,
  }
}