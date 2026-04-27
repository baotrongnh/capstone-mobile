import { storage } from "@/stores/storage"
import { DeviceEventEmitter } from "react-native"

export const NOTIFICATION_DEBUG_EVENT = "notification-opened"
export const NOTIFICATION_DEBUG_STORAGE_KEY = "notification:last-opened"

export type NotificationDebugPayload = {
     openedAt: string
     source: "background" | "quit"
     messageId?: string
     data?: Record<string, unknown>
     notification?: unknown
     routeHref?: string | null
     routeMatched: boolean
}

const toText = (value: unknown) => typeof value === "string" ? value.toLowerCase() : ""

export const isFireAlarmNotification = (payload: NotificationDebugPayload | null) => {
     if (!payload) {
          return false
     }

     const data = payload.data ?? {}
     const notification = payload.notification as { title?: unknown; body?: unknown } | undefined
     const title = toText(notification?.title)
     const body = toText(notification?.body)

     return title.includes("fire alert")
          || body.includes("fire alert")
          || (data.type === "error" && data.relatedEntityType === "Apartment" && body.includes("fire"))
}

export const saveNotificationDebugPayload = async (payload: NotificationDebugPayload) => {
     await storage.setItem(NOTIFICATION_DEBUG_STORAGE_KEY, JSON.stringify(payload))
     DeviceEventEmitter.emit(NOTIFICATION_DEBUG_EVENT, payload)
}

export const getLastNotificationDebugPayload = async (): Promise<NotificationDebugPayload | null> => {
     const savedPayload = await storage.getItem(NOTIFICATION_DEBUG_STORAGE_KEY)
     if (!savedPayload) {
          return null
     }

     try {
          return JSON.parse(savedPayload) as NotificationDebugPayload
     } catch {
          return null
     }
}
