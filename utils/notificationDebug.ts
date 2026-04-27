import { storage } from "@/stores/storage"
import { DeviceEventEmitter } from "react-native"

export const NOTIFICATION_DEBUG_EVENT = "notification-opened"
export const NOTIFICATION_DEBUG_STORAGE_KEY = "notification:last-opened"
export const PENDING_NOTIFICATION_ROUTE_STORAGE_KEY = "notification:pending-route"

export type NotificationDebugPayload = {
     openedAt: string
     source: "background" | "quit"
     messageId?: string
     data?: Record<string, unknown>
     notification?: unknown
     routeHref?: string | null
     routeMatched: boolean
}

const toText = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value).toLowerCase() : ""

export const isFireAlarmNotification = (payload: NotificationDebugPayload | null) => {
     if (!payload) {
          return false
     }

     const data = payload.data ?? {}
     const notification = payload.notification as { title?: unknown; body?: unknown } | undefined
     const title = toText(notification?.title)
     const body = toText(notification?.body)

     const type = toText(data.type)
     const screen = toText(data.screen)
     const eventType = toText(data.eventType)
     const actionUrl = toText(data.actionUrl)
     const relatedEntityType = toText(data.relatedEntityType)

     return title.includes("fire alert")
          || title.includes("cảnh báo cháy")
          || body.includes("fire alert")
          || body.includes("báo cháy")
          || type === "fire_alarm"
          || screen === "fire_alarm_control"
          || eventType === "fire"
          || actionUrl.includes("/iot/fire-alarm")
          || (type === "error" && relatedEntityType === "apartment" && body.includes("fire"))
}

export const saveNotificationDebugPayload = async (payload: NotificationDebugPayload) => {
     await storage.setItem(NOTIFICATION_DEBUG_STORAGE_KEY, JSON.stringify(payload))

     if (payload.source === "quit" && payload.routeHref) {
          await storage.setItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY, payload.routeHref)
     }

     DeviceEventEmitter.emit(NOTIFICATION_DEBUG_EVENT, payload)
}

export const consumePendingNotificationRoute = async () => {
     const routeHref = await storage.getItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY)

     if (routeHref) {
          await storage.removeItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY)
     }

     return routeHref
}

export const clearPendingNotificationRoute = async () => {
     await storage.removeItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY)
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
