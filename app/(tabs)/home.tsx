import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import WeatherOverviewCard from "@/components/apartment/WeatherOverviewCard"
import { StyledContainer } from "@/components/styles"
import { useUnreadNotificationCount } from "@/hooks/query/useNotifications"
import { useRouter } from "expo-router"
import React from "react"
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

const SUPPORT_PHONE = "0332667829"

type QuickAction = {
     id: "smart-home" | "service" | "invoice" | "more"
     label: string
     icon: keyof typeof MaterialCommunityIcons.glyphMap
}

const quickActions: QuickAction[] = [
     { id: "smart-home", label: "Điều khiển", icon: "home-automation" },
     { id: "service", label: "Dịch vụ", icon: "tools" },
     { id: "invoice", label: "Hóa đơn", icon: "file-document-outline" },
     { id: "more", label: "Xem thêm", icon: "dots-grid" },
]

export default function HomeScreen() {
     const router = useRouter()
     const { data: unreadCount = 0 } = useUnreadNotificationCount()

     const onPressSupportCall = async () => {
          const phoneUrl = `tel:${SUPPORT_PHONE}`

          try {
               const supported = await Linking.canOpenURL(phoneUrl)
               if (!supported) {
                    Alert.alert("Hỗ trợ", `Không thể mở ứng dụng gọi điện. Vui lòng gọi: ${SUPPORT_PHONE}`)
                    return
               }

               await Linking.openURL(phoneUrl)
          } catch {
               Alert.alert("Hỗ trợ", `Không thể mở ứng dụng gọi điện. Vui lòng gọi: ${SUPPORT_PHONE}`)
          }
     }

     const onPressSupportGuide = () => {
          Alert.alert("Hỗ trợ", "Function trung tâm hỗ trợ.")
     }

     const onPressAction = (id: QuickAction["id"]) => {
          if (id === "smart-home") {
               router.push("/(tabs)/apartment")
               return
          }

          if (id === "invoice") {
               router.push("/invoices")
               return
          }

          if (id === "more") {
               router.push("/more-services")
               return
          }

          Alert.alert("Thông báo", "Tính năng Dịch vụ sẽ được bổ sung sau.")
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
               >
                    <View style={styles.heroCard}>
                         <View style={styles.heroContent}>
                              <Text style={styles.greetingLabel}>Xin chào,</Text>
                              <Text numberOfLines={1} style={styles.greetingName}>
                                   Nguyễn Huỳnh Bảo Trọng
                              </Text>

                              <View style={styles.heroWeatherWrap}>
                                   <Text style={styles.heroWeatherLabel}>Thời tiết hôm nay</Text>
                                   <WeatherOverviewCard variant="inline" />
                              </View>
                         </View>

                         <Pressable
                              onPress={() => router.push("/notifications")}
                              style={styles.bellButton}
                         >
                              <Ionicons name="notifications-outline" size={22} color="#1e293b" />
                              {unreadCount > 0 ? (
                                   <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                                   </View>
                              ) : null}
                         </Pressable>
                    </View>
                    <View style={styles.actionsCard}>
                         {quickActions.map((item) => (
                              <Pressable
                                   key={item.id}
                                   onPress={() => onPressAction(item.id)}
                                   style={styles.actionItem}
                              >
                                   <View style={styles.actionIconWrap}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#3b82f6" />
                                   </View>
                                   <Text numberOfLines={2} style={styles.actionText}>
                                        {item.label}
                                   </Text>
                              </Pressable>
                         ))}
                    </View>

                    <View style={styles.apartmentCard}>
                         <View style={styles.apartmentInfo}>
                              <Text numberOfLines={1} style={styles.apartmentCode}>Tất cả căn hộ</Text>
                              <Text numberOfLines={2} style={styles.apartmentAddress}>Xem những căn hộ bạn thuê</Text>
                         </View>

                         <Pressable
                              onPress={() => router.push("/my-apartments")}
                              style={styles.detailButton}
                         >
                              <Text style={styles.detailButtonText}>Xem tất cả</Text>
                         </Pressable>
                    </View>

                    <View style={styles.summaryCard}>
                         <View style={styles.summaryIconWrap}>
                              <MaterialCommunityIcons name="lightning-bolt-outline" size={24} color="#2563eb" />
                         </View>
                         <View style={styles.summaryBody}>
                              <Text style={styles.summaryTitle}>Nhà thông minh đang hoạt động ổn định</Text>
                              <Text style={styles.summaryText}>
                                   4 thiết bị đã kết nối. Bạn có thể chuyển sang tab Căn hộ để điều khiển chi tiết.
                              </Text>
                         </View>
                    </View>

                    <View style={styles.supportCard}>
                         <Text style={styles.supportTitle}>Hỗ trợ</Text>
                         <Text style={styles.supportText}>
                              Cần trợ giúp nhanh? Liên hệ ban quản lý hoặc mở hướng dẫn sử dụng.
                         </Text>

                         <View style={styles.supportButtons}>
                              <Pressable onPress={onPressSupportCall} style={styles.supportPrimaryButton}>
                                   <MaterialCommunityIcons name="phone-outline" size={18} color="#ffffff" />
                                   <Text style={styles.supportPrimaryButtonText}>Gọi ban quản lý</Text>
                              </Pressable>

                              <Pressable onPress={onPressSupportGuide} style={styles.supportSecondaryButton}>
                                   <MaterialCommunityIcons name="help-circle-outline" size={18} color="#2563eb" />
                                   <Text style={styles.supportSecondaryButtonText}>Xem hướng dẫn</Text>
                              </Pressable>
                         </View>
                    </View>
               </ScrollView>
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: "#f3f5f9",
          paddingHorizontal: 18,
     },
     content: {
          paddingBottom: 130,
          gap: 14,
     },
     heroCard: {
          borderRadius: 22,
          backgroundColor: "#3b82f6",
          padding: 18,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
     },
     heroContent: {
          flex: 1,
          minWidth: 0,
     },
     greetingLabel: {
          fontSize: 18,
          color: "#ffffff",
          fontWeight: "500",
     },
     greetingName: {
          marginTop: 4,
          maxWidth: 240,
          fontSize: 28,
          fontWeight: "800",
          color: "#ffffff",
     },
     heroWeatherWrap: {
          marginTop: 12,
          width: "100%",
          gap: 4,
     },
     heroWeatherLabel: {
          fontSize: 12,
          color: "rgba(255,255,255,0.88)",
          fontWeight: "600",
     },
     bellButton: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
     },
     badge: {
          position: "absolute",
          top: -4,
          right: -4,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: "#ef4444",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 5,
     },
     badgeText: {
          fontSize: 10,
          fontWeight: "700",
          color: "#ffffff",
     },
     actionsCard: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 8,
     },
     actionItem: {
          width: "24%",
          alignItems: "center",
          minHeight: 92,
          gap: 8,
     },
     actionIconWrap: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#eaf2ff",
          alignItems: "center",
          justifyContent: "center",
     },
     actionText: {
          fontSize: 13,
          lineHeight: 17,
          minHeight: 34,
          textAlign: "center",
          color: "#334155",
          fontWeight: "500",
     },
     apartmentCard: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          padding: 15,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
     },
     apartmentInfo: {
          flex: 1,
          minWidth: 0,
     },
     apartmentCode: {
          fontSize: 22,
          fontWeight: "700",
          color: "#0f172a",
     },
     apartmentAddress: {
          marginTop: 4,
          fontSize: 14,
          color: "#64748b",
     },
     detailButton: {
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 999,
          backgroundColor: "#3b82f6",
          flexShrink: 0,
          alignSelf: "flex-start",
     },
     detailButtonText: {
          color: "#ffffff",
          fontWeight: "700",
          fontSize: 13,
     },
     summaryCard: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          padding: 14,
          flexDirection: "row",
          gap: 12,
     },
     summaryIconWrap: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "#eaf2ff",
          alignItems: "center",
          justifyContent: "center",
     },
     summaryBody: {
          flex: 1,
          gap: 4,
     },
     summaryTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: "#0f172a",
     },
     summaryText: {
          fontSize: 13,
          lineHeight: 18,
          color: "#64748b",
     },
     supportCard: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#dbe5f3",
          padding: 14,
          gap: 10,
     },
     supportTitle: {
          fontSize: 17,
          fontWeight: "700",
          color: "#0f172a",
     },
     supportText: {
          fontSize: 13,
          lineHeight: 18,
          color: "#64748b",
     },
     supportButtons: {
          flexDirection: "row",
          gap: 10,
     },
     supportPrimaryButton: {
          flex: 1,
          borderRadius: 12,
          backgroundColor: "#3b82f6",
          minHeight: 44,
          paddingVertical: 11,
          paddingHorizontal: 12,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
     },
     supportPrimaryButtonText: {
          fontSize: 13,
          color: "#ffffff",
          fontWeight: "700",
     },
     supportSecondaryButton: {
          flex: 1,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#bfdbfe",
          backgroundColor: "#eff6ff",
          minHeight: 44,
          paddingVertical: 11,
          paddingHorizontal: 12,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
     },
     supportSecondaryButtonText: {
          fontSize: 13,
          color: "#2563eb",
          fontWeight: "700",
     },
})