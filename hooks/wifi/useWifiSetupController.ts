import {
  getProbeFailureMessage,
  getReadinessMessage,
  getStatusDisplay,
  LOG_PREFIX,
  mapServerStatus,
  POLL_ERROR_RETRY,
  POLL_INTERVAL_MS,
  POLL_MAX_RETRY,
  READINESS_TIMEOUT_MS,
  REQUIRED_DEVICE_WIFI,
  WIFI_MESSAGES,
} from "@/hooks/wifi/wifi-setup.constants"
import { wifiService, type WifiStatus } from "@/lib/services/wifi.service"
import { Keyboard } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

  const setReadiness = useCallback((status: WifiStatus, message: string) => {
    setStatus(status)
    setMessage(message)
  }, [])

  const checkDeviceNetwork = useCallback(
    async (silent = false) => {
      setIsCheckingNetwork(true)

      try {
        const readiness = await wifiService.checkDeviceReadiness(READINESS_TIMEOUT_MS)
        const nextStatus = readiness.reachable ? mapServerStatus(readiness.status) : "idle"

        logDebug("device-network-check", readiness)
        setIsOnDeviceNetwork(readiness.reachable)

        if (silent) {
          setStatus("idle")
          setMessage("")
          return readiness.reachable
        }

        setStatus(nextStatus)

        setMessage(
          readiness.reachable
            ? getReadinessMessage(nextStatus)
            : getProbeFailureMessage(readiness.reason),
        )

        return readiness.reachable
      } finally {
        setIsCheckingNetwork(false)
      }
    },
    [logDebug],
  )

  const schedulePoll = useCallback(
    (retry = 0, errorRetry = 0) => {
      clearPollTimer()

      pollTimer.current = setTimeout(async () => {
        try {
          const data = await wifiService.getStatus()
          const nextStatus = mapServerStatus(data.status)

          logDebug("poll-status", { retry, status: nextStatus })

          if (nextStatus === "connected") {
            setReadiness(nextStatus, WIFI_MESSAGES.connected)
            return
          }

          if (nextStatus === "failed") {
            setReadiness(nextStatus, WIFI_MESSAGES.failed)
            return
          }

          if (retry >= POLL_MAX_RETRY) {
            setReadiness("failed", WIFI_MESSAGES.pollTimeout)
            return
          }

          setReadiness("connecting", WIFI_MESSAGES.connecting)
          schedulePoll(retry + 1, 0)
        } catch (error) {
          logDebug("poll-status-error", { retry, errorRetry, error })

          if (errorRetry >= POLL_ERROR_RETRY) {
            setReadiness("failed", WIFI_MESSAGES.pollError)
            return
          }

          schedulePoll(retry, errorRetry + 1)
        }
      }, POLL_INTERVAL_MS)
    },
    [clearPollTimer, logDebug, setReadiness],
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
      setReadiness("sending", WIFI_MESSAGES.sendingConfig)
      logDebug("send-config", { ssid: trimmedSsid })

      const data = await wifiService.sendConfig({ ssid: trimmedSsid, password })
      const nextStatus = mapServerStatus(data.status)

      logDebug("send-config-result", data)

      if (nextStatus === "connected") {
        setReadiness(nextStatus, WIFI_MESSAGES.connected)
        return
      }

      if (nextStatus === "failed") {
        setReadiness(nextStatus, WIFI_MESSAGES.failedAfterSend)
        return
      }

      setReadiness("connecting", WIFI_MESSAGES.waitingForDevice)
      schedulePoll()
    } catch (error) {
      logDebug("send-config-error", error)
      setReadiness("failed", WIFI_MESSAGES.sendConfigError)
    }
  }, [checkDeviceNetwork, clearPollTimer, logDebug, password, schedulePoll, setReadiness, trimmedSsid])

  useEffect(() => clearPollTimer, [clearPollTimer])

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
