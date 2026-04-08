import { notificationService } from "@/lib/services/notification.service"
import { NotificationListQueryParams } from "@/types/notification"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useNotifications = (params?: NotificationListQueryParams) => {
     return useQuery({
          queryKey: ["notifications", params],
          queryFn: () => notificationService.getMyNotifications(params),
     })
}

export const useUnreadNotificationCount = () => {
     return useQuery({
          queryKey: ["notifications", "unread-count"],
          queryFn: () => notificationService.getUnreadCount(),
     })
}

export const useMarkNotificationAsRead = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["notifications"] })
          },
     })
}

export const useMarkAllNotificationsAsRead = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: notificationService.markAllAsRead,
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["notifications"] })
          },
     })
}
