import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"
import {
     NotificationListQueryParams,
     NotificationListResponse,
} from "@/types/notification"

type RegisterFcmTokenPayload = {
     token: string
     device?: string
}

const getNumber = (value: unknown): number | null => {
     if (typeof value === "number" && Number.isFinite(value)) {
          return value
     }

     if (typeof value === "string") {
          const parsed = Number(value)
          if (Number.isFinite(parsed)) {
               return parsed
          }
     }

     return null
}

const parseUnreadCount = (payload: unknown): number => {
     if (!payload || typeof payload !== "object") {
          return 0
     }

     const root = payload as Record<string, unknown>
     const directCount = getNumber(root.count)
     if (directCount !== null) {
          return directCount
     }

     const directUnreadCount = getNumber(root.unreadCount)
     if (directUnreadCount !== null) {
          return directUnreadCount
     }

     const data = root.data
     if (data && typeof data === "object") {
          const dataRecord = data as Record<string, unknown>
          const dataCount = getNumber(dataRecord.count)
          if (dataCount !== null) {
               return dataCount
          }

          const dataUnreadCount = getNumber(dataRecord.unreadCount)
          if (dataUnreadCount !== null) {
               return dataUnreadCount
          }
     }

     return 0
}

export const notificationService = {
     getMyNotifications: async (
          params?: NotificationListQueryParams,
     ): Promise<NotificationListResponse> => {
          const { data } = await apiClient.get<NotificationListResponse>(
               `${endpoints.notifications}/my`,
               { params },
          )

          return data
     },

     getUnreadCount: async (): Promise<number> => {
          const { data } = await apiClient.get(`${endpoints.notifications}/unread-count`)
          return parseUnreadCount(data)
     },

     markAsRead: async (id: string): Promise<void> => {
          await apiClient.patch(`${endpoints.notifications}/${id}/read`)
     },

     markAllAsRead: async (): Promise<void> => {
          await apiClient.patch(`${endpoints.notifications}/read-all`)
     },

     registerFcmToken: async (payload: RegisterFcmTokenPayload): Promise<void> => {
          await apiClient.post(`${endpoints.notifications}/fcm-token`, payload)
     },

     removeFcmToken: async (token: string): Promise<void> => {
          await apiClient.delete(`${endpoints.notifications}/fcm-token`, {
               data: { token },
          })
     },
}
