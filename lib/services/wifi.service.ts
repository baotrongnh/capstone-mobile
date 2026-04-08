import { espClient } from "@/lib/apis/esp-client"

const STATUS_ENDPOINT = "/status"

export type WifiConfigPayload = {
     ssid: string
     password: string
}

export type WifiStatus = "idle" | "sending" | "connecting" | "connected" | "failed"

export type WifiStatusResponse = {
     status?: "connecting" | "connected" | "failed" | string
     [key: string]: unknown
}

export type WifiDeviceReadiness = {
     reachable: boolean
     status: WifiStatusResponse["status"] | null
}

const fetchStatus = async (timeoutMs: number) => {
     const { data } = await espClient.get<WifiStatusResponse>(STATUS_ENDPOINT, { timeout: timeoutMs })
     return data
}

export const wifiService = {
     sendConfig: async (payload: WifiConfigPayload) => {
          const { data } = await espClient.post<WifiStatusResponse>("/config", payload)
          return data
     },

     getStatus: async (timeoutMs = 10000) => {
          return fetchStatus(timeoutMs)
     },

     checkDeviceReadiness: async (timeoutMs = 2500): Promise<WifiDeviceReadiness> => {
          try {
               const data = await fetchStatus(timeoutMs)
               return {
                    reachable: true,
                    status: typeof data.status === "string" ? data.status : null,
               }
          } catch {
               return {
                    reachable: false,
                    status: null,
               }
          }
     },
}
