import type { paths } from "@/types/api"

export type NotificationListResponse =
     paths["/api/v1/notifications/my"]["get"]["responses"]["200"]["content"]["application/json"]
export type NotificationListQueryParams = NonNullable<
     paths["/api/v1/notifications/my"]["get"]["parameters"]["query"]
>

export type NotificationItem = NonNullable<NotificationListResponse["data"]>[number]
export type NotificationList = NotificationItem[]
