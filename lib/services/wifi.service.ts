import { espClient } from "@/lib/apis/esp-client"

export type WifiConfigPayload = {
     ssid: string
     password: string
}

export type WifiStatus = "idle" | "sending" | "connecting" | "connected" | "failed"

export type WifiStatusResponse = {
     status?: "connecting" | "connected" | "failed" | string
     [key: string]: unknown
}

export const wifiService = {
     sendConfig: async (payload: WifiConfigPayload) => {
          const { data } = await espClient.post<WifiStatusResponse>("/config", payload)
          return data
     },

     getStatus: async () => {
          const { data } = await espClient.get<WifiStatusResponse>("/status")
          return data
     },
}
