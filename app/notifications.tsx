import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { StyledContainer } from "@/components/styles"
import {
     useMarkAllNotificationsAsRead,
     useMarkNotificationAsRead,
     useNotifications,
} from "@/hooks/query/useNotifications"
import { NotificationItem } from "@/types/notification"
import { useRouter } from "expo-router"
import React from "react"
import {
     ActivityIndicator,
     FlatList,
     Pressable,
     RefreshControl,
     StyleSheet,
     Text,
     View,
} from "react-native"

const typeIconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
     info: "information-outline",
     warning: "alert-outline",
     success: "check-circle-outline",
     error: "close-circle-outline",
     reminder: "clock-outline",
     promotion: "tag-outline",
}

const typeColorMap: Record<string, string> = {
     info: "#2563eb",
     warning: "#d97706",
     success: "#059669",
     error: "#dc2626",
     reminder: "#7c3aed",
     promotion: "#ea580c",
}

const formatTime = (isoDate: string) => {
     const date = new Date(isoDate)
     if (Number.isNaN(date.getTime())) {
          return "Vừa xong"
     }

     return date.toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
     })
}

const getTypeIcon = (type: string) => typeIconMap[type] ?? "bell-outline"
const getTypeColor = (type: string) => typeColorMap[type] ?? "#3b82f6"

export default function NotificationsScreen() {
     const router = useRouter()
     const { data, isLoading, isError, isRefetching, refetch } = useNotifications()
     const markAsReadMutation = useMarkNotificationAsRead()
     const markAllMutation = useMarkAllNotificationsAsRead()

     const notifications = data?.data ?? []
     const unreadCount = notifications.filter((item) => !item.isRead).length

     const onPressItem = (item: NotificationItem) => {
          if (!item.isRead) {
               markAsReadMutation.mutate(item.id)
          }
     }

     const onMarkAll = () => {
          if (!unreadCount || markAllMutation.isPending) {
               return
          }

          markAllMutation.mutate()
     }

     const renderItem = ({ item }: { item: NotificationItem }) => {
          const iconColor = getTypeColor(item.notificationType)

          return (
               <Pressable
                    onPress={() => onPressItem(item)}
                    style={[styles.item, !item.isRead && styles.itemUnread]}
               >
                    <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
                         <MaterialCommunityIcons
                              name={getTypeIcon(item.notificationType)}
                              size={22}
                              color={iconColor}
                         />
                    </View>

                    <View style={styles.itemBody}>
                         <View style={styles.itemHeaderRow}>
                              <Text numberOfLines={1} style={styles.itemTitle}>
                                   {item.title}
                              </Text>
                              <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                         </View>

                         <Text numberOfLines={2} style={styles.itemMessage}>
                              {item.message}
                         </Text>

                         {!item.isRead ? <View style={styles.unreadDot} /> : null}
                    </View>
               </Pressable>
          )
     }

     return (
          <StyledContainer style={styles.container}>
               <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                         <Ionicons name="chevron-back" size={24} color="#334155" />
                    </Pressable>

                    <Text style={styles.headerTitle}>Thông báo</Text>

                    <Pressable
                         disabled={!unreadCount || markAllMutation.isPending}
                         onPress={onMarkAll}
                         style={styles.markAllButton}
                    >
                         <Text
                              style={[
                                   styles.markAllText,
                                   (!unreadCount || markAllMutation.isPending) && styles.markAllTextDisabled,
                              ]}
                         >
                              Đánh dấu tất cả
                         </Text>
                    </Pressable>
               </View>

               {isLoading ? (
                    <View style={styles.centerState}>
                         <ActivityIndicator color="#3b82f6" size="small" />
                         <Text style={styles.stateText}>Đang tải thông báo...</Text>
                    </View>
               ) : isError ? (
                    <View style={styles.centerState}>
                         <Text style={styles.stateTitle}>Không thể tải thông báo</Text>
                         <Pressable onPress={() => refetch()} style={styles.retryButton}>
                              <Text style={styles.retryText}>Thử lại</Text>
                         </Pressable>
                    </View>
               ) : (
                    <FlatList
                         data={notifications}
                         keyExtractor={(item) => item.id}
                         renderItem={renderItem}
                         showsVerticalScrollIndicator={false}
                         contentContainerStyle={[
                              styles.listContent,
                              !notifications.length && styles.listEmptyContent,
                         ]}
                         refreshControl={
                              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
                         }
                         ListEmptyComponent={
                              <View style={styles.centerState}>
                                   <Text style={styles.stateTitle}>Bạn chưa có thông báo</Text>
                                   <Text style={styles.stateText}>Thông báo mới sẽ xuất hiện tại đây.</Text>
                              </View>
                         }
                    />
               )}
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: "#f3f5f9",
          paddingHorizontal: 20,
     },
     header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
     },
     backButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
     },
     headerTitle: {
          flex: 1,
          marginLeft: 10,
          fontSize: 22,
          fontWeight: "700",
          color: "#0f172a",
     },
     markAllButton: {
          paddingVertical: 6,
          paddingHorizontal: 8,
     },
     markAllText: {
          fontSize: 13,
          fontWeight: "600",
          color: "#2563eb",
     },
     markAllTextDisabled: {
          color: "#94a3b8",
     },
     listContent: {
          paddingBottom: 120,
          gap: 10,
     },
     listEmptyContent: {
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 120,
     },
     item: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
     },
     itemUnread: {
          borderColor: "#bfdbfe",
          backgroundColor: "#f8fbff",
     },
     iconWrap: {
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
     },
     itemBody: {
          flex: 1,
     },
     itemHeaderRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
     },
     itemTitle: {
          flex: 1,
          fontSize: 15,
          fontWeight: "700",
          color: "#0f172a",
     },
     itemTime: {
          fontSize: 11,
          color: "#64748b",
     },
     itemMessage: {
          marginTop: 6,
          fontSize: 13,
          lineHeight: 19,
          color: "#475569",
     },
     unreadDot: {
          marginTop: 10,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#2563eb",
     },
     centerState: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingBottom: 120,
     },
     stateTitle: {
          fontSize: 16,
          fontWeight: "700",
          color: "#0f172a",
     },
     stateText: {
          fontSize: 13,
          color: "#64748b",
     },
     retryButton: {
          marginTop: 4,
          paddingVertical: 9,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: "#2563eb",
     },
     retryText: {
          color: "#ffffff",
          fontWeight: "600",
     },
})
