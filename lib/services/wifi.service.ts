import { espClient } from "@/lib/apis/esp-client"
import { isAxiosError } from "axios"

const STATUS_ENDPOINT = "/status"

export type WifiConfigPayload = {
  ssid: string
  password: string
}

export type WifiStatus = "idle" | "sending" | "connecting" | "connected" | "failed"
export type WifiProbeReason = "timeout" | "network_unavailable" | "http_blocked" | "unknown"

export type WifiStatusResponse = {
  status?: "connecting" | "connected" | "failed" | string
  [key: string]: unknown
}

export type WifiDeviceReadiness = {
  reachable: boolean
  status: WifiStatusResponse["status"] | null
  reason?: WifiProbeReason
}

const fetchStatus = async (timeout: number) => {
  const { data } = await espClient.get<WifiStatusResponse>(STATUS_ENDPOINT, { timeout })
  return data
}

const getProbeReason = (error: unknown): WifiProbeReason => {
  if (!isAxiosError(error)) {
    return "unknown"
  }

  const message = error.message?.toLowerCase() ?? ""

  if (error.code === "ECONNABORTED" || message.includes("timeout")) {
    return "timeout"
  }

  if (
    message.includes("cleartext") ||
    message.includes("not permitted") ||
    message.includes("network security policy")
  ) {
    return "http_blocked"
  }

  if (
    error.code === "ERR_NETWORK" ||
    message.includes("network error") ||
    message.includes("failed to connect") ||
    message.includes("unable to resolve host")
  ) {
    return "network_unavailable"
  }

  return "unknown"
}

export const wifiService = {
  sendConfig: async (payload: WifiConfigPayload) => {
    const { data } = await espClient.post<WifiStatusResponse>("/config", payload)
    return data
  },

  getStatus: async (timeout = 10000) => {
    return fetchStatus(timeout)
  },

  checkDeviceReadiness: async (timeout = 2500): Promise<WifiDeviceReadiness> => {
    try {
      const data = await fetchStatus(timeout)
      return {
        reachable: true,
        status: typeof data.status === "string" ? data.status : null,
      }
    } catch (error) {
      return {
        reachable: false,
        status: null,
        reason: getProbeReason(error),
      }
    }
  },
}
