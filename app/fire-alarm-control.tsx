import { useApartment } from "@/hooks/query/useApartments"
import { iotServices } from "@/lib/services/iot.service"
import type { IoTControlRequestBody } from "@/lib/services/iot.service"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const EMERGENCY_PHONE = "114"
const SUPPORT_PHONE = "0332667829"

const toText = (value: string | string[] | undefined, fallback = "") => {
     if (Array.isArray(value)) return value[0] || fallback
     return value || fallback
}

const joinAddress = (...parts: Array<string | null | undefined>) => parts.map((part) => part?.trim()).filter(Boolean).join(", ")

const toTopic = (value: string): IoTControlRequestBody["topic"] => {
     const allowedTopics: IoTControlRequestBody["topic"][] = ["light", "alarm", "door", "curtain", "electric", "water"]
     return allowedTopics.includes(value as IoTControlRequestBody["topic"]) ? value as IoTControlRequestBody["topic"] : "alarm"
}

const toAction = (value: string): IoTControlRequestBody["action"] => {
     const action = value.toUpperCase()
     return action === "ON" || action === "OFF" ? action : "OFF"
}

export default function FireAlarmControlScreen() {
     const params = useLocalSearchParams<{ espId?: string; deviceId?: string; deviceTopic?: string; action?: string; apartmentId?: string }>()
     const [isSendingOff, setIsSendingOff] = useState(false)
     const [isAlarmOffSent, setIsAlarmOffSent] = useState(false)

     const apartmentId = toText(params.apartmentId)
     const { data: apartmentResponse, isLoading: isApartmentLoading } = useApartment(apartmentId)
     const apartment = apartmentResponse?.data

     const alarmPayload = useMemo(() => {
          const espId = toText(params.espId, "ESP_A101")
          const deviceId = Number(toText(params.deviceId, "1"))
          return {
               espId,
               deviceId: Number.isInteger(deviceId) ? deviceId : 1,
               topic: toTopic(toText(params.deviceTopic, "alarm")),
               action: toAction(toText(params.action, "OFF")),
               apartmentId: apartmentId || "Không xác định",
          }
     }, [apartmentId, params.action, params.deviceId, params.deviceTopic, params.espId])

     const apartmentTitle = apartment?.apartmentNumber ? `Mã căn hộ ${apartment.apartmentNumber}` : alarmPayload.apartmentId
     const apartmentAddress = joinAddress(apartment?.streetAddress, apartment?.fullAddress) || apartment?.buildingName || "Chưa có địa chỉ"
     const apartmentFloor = typeof apartment?.floorNumber === "number" ? String(apartment.floorNumber) : "Không rõ"

     const callPhone = async (phone: string) => {
          const phoneUrl = `tel:${phone}`
          try {
               const supported = await Linking.canOpenURL(phoneUrl)
               if (!supported) {
                    Alert.alert("Không thể gọi", `Vui lòng gọi trực tiếp số ${phone}`)
                    return
               }
               await Linking.openURL(phoneUrl)
          } catch {
               Alert.alert("Không thể gọi", `Vui lòng gọi trực tiếp số ${phone}`)
          }
     }

     const turnOffAlarm = async () => {
          if (isSendingOff || isAlarmOffSent) return
          setIsSendingOff(true)
          try {
               await iotServices.deviceControl({ espId: alarmPayload.espId, deviceId: alarmPayload.deviceId, topic: alarmPayload.topic, action: alarmPayload.action })
               setIsAlarmOffSent(true)
          } catch {
               Alert.alert("Lỗi", "Không thể gửi lệnh tắt báo cháy. Vui lòng thử lại hoặc liên hệ ban quản lý.")
          } finally {
               setIsSendingOff(false)
          }
     }

     return (
          <SafeAreaView style={styles.container}>
               <Stack.Screen options={{ headerShown: false }} />
               <StatusBar barStyle="light-content" backgroundColor="#2f0606" />
               <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.backgroundGlowTop} />
                    <View style={styles.backgroundGlowBottom} />
                    <View style={styles.topBar}>
                         <Pressable onPress={router.back} style={styles.iconButton}><MaterialIcons name="arrow-back" size={22} color="#ffffff" /></Pressable>
                         <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveBadgeText}>KHẨN CẤP</Text></View>
                    </View>
                    <View style={styles.heroCard}>
                         <View style={styles.pulseOuter}><View style={styles.pulseMiddle}><View style={styles.pulseInner}><MaterialCommunityIcons name="fire-alert" size={62} color="#ffffff" /></View></View></View>
                         <Text style={styles.eyebrow}>Hệ thống IoT phát hiện rủi ro</Text>
                         <Text style={styles.title}>Cảnh báo cháy</Text>
                         <Text style={styles.subtitle}>Kiểm tra khu vực ngay lập tức. Chỉ tắt còi khi đã xác nhận an toàn.</Text>
                    </View>

                    <View style={styles.apartmentAlertCard}>
                         <View style={styles.apartmentAlertHeader}>
                              <MaterialCommunityIcons name="home-alert" size={22} color="#ffffff" />
                              <Text style={styles.apartmentAlertLabel}>Căn hộ đang báo cháy</Text>
                         </View>
                         {isApartmentLoading ? (
                              <Text style={styles.apartmentLoadingText}>Đang tải thông tin căn hộ...</Text>
                         ) : (
                              <Text style={styles.apartmentTitle}>{apartmentTitle}</Text>
                         )}
                         <View style={styles.apartmentMetaRow}>
                              <Text style={styles.apartmentMetaLabel}>Tầng</Text>
                              <Text style={styles.apartmentMetaValue}>{apartmentFloor}</Text>
                         </View>
                         <View style={styles.apartmentMetaRow}>
                              <Text style={styles.apartmentMetaLabel}>Địa chỉ</Text>
                              <Text style={styles.apartmentMetaValue}>{isApartmentLoading ? "..." : apartmentAddress}</Text>
                         </View>
                    </View>
                    <View style={styles.infoPanel}>
                         <View style={styles.infoHeader}><MaterialCommunityIcons name="router-wireless-settings" size={20} color="#fecaca" /><Text style={styles.infoHeaderText}>Thông tin thiết bị</Text></View>
                         <View style={styles.infoGrid}>
                              <View style={styles.infoCard}><Text style={styles.infoLabel}>Board</Text><Text style={styles.infoValue}>{alarmPayload.espId}</Text></View>
                              <View style={styles.infoCard}><Text style={styles.infoLabel}>Thiết bị</Text><Text style={styles.infoValue}>#{alarmPayload.deviceId}</Text></View>
                              <View style={styles.infoCard}><Text style={styles.infoLabel}>Topic</Text><Text style={styles.infoValue}>{alarmPayload.topic}</Text></View>
                              <View style={styles.infoCard}><Text style={styles.infoLabel}>Lệnh tắt</Text><Text style={styles.infoValue}>{alarmPayload.action}</Text></View>
                         </View>
                    </View>
                    <View style={styles.warningCard}><View style={styles.warningIcon}><MaterialCommunityIcons name="shield-alert-outline" size={24} color="#ffffff" /></View><View style={styles.warningTextWrap}><Text style={styles.warningTitle}>Ưu tiên an toàn</Text><Text style={styles.warningText}>Rời khỏi khu vực nguy hiểm, cảnh báo người xung quanh và liên hệ cứu hộ nếu cần.</Text></View></View>
                    <Pressable disabled={isSendingOff || isAlarmOffSent} onPress={turnOffAlarm} style={({ pressed }) => [styles.primaryButton, (isSendingOff || isAlarmOffSent) && styles.disabledButton, pressed && styles.buttonPressed]}>
                         {isSendingOff ? <ActivityIndicator size="small" color="#ffffff" /> : <MaterialCommunityIcons name="alarm-light-off-outline" size={24} color="#ffffff" />}
                         <Text style={styles.primaryButtonText}>{isAlarmOffSent ? "Đã gửi lệnh tắt báo cháy" : "Tắt báo cháy"}</Text>
                    </Pressable>
                    <View style={styles.actionsRow}>
                         <Pressable onPress={() => void callPhone(EMERGENCY_PHONE)} style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}><MaterialCommunityIcons name="phone-alert-outline" size={22} color="#ffffff" /><Text style={styles.actionText}>Gọi 114</Text></Pressable>
                         <Pressable onPress={() => void callPhone(SUPPORT_PHONE)} style={({ pressed }) => [styles.supportButton, pressed && styles.buttonPressed]}><MaterialCommunityIcons name="account-tie-voice-outline" size={22} color="#7f1d1d" /><Text style={styles.supportText}>Ban quản lý</Text></Pressable>
                    </View>
               </ScrollView>
          </SafeAreaView>
     )
}

const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: "#1f0708" },
     content: { flexGrow: 1, padding: 18, paddingBottom: 34, gap: 14, overflow: "hidden" },
     backgroundGlowTop: { position: "absolute", top: -96, right: -88, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(248,113,113,0.20)" },
     backgroundGlowBottom: { position: "absolute", bottom: 56, left: -110, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(127,29,29,0.34)" },
     topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
     iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
     liveBadge: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, backgroundColor: "rgba(254,242,242,0.96)", paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: "rgba(254,202,202,0.9)" },
     liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#dc2626" },
     liveBadgeText: { color: "#991b1b", fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
     heroCard: { marginTop: 8, borderRadius: 34, backgroundColor: "rgba(255,255,255,0.08)", padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", gap: 12 },
     pulseOuter: { width: 132, height: 132, borderRadius: 66, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(254,202,202,0.24)" },
     pulseMiddle: { width: 106, height: 106, borderRadius: 53, backgroundColor: "rgba(239,68,68,0.22)", alignItems: "center", justifyContent: "center" },
     pulseInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
     eyebrow: { marginTop: 4, color: "#fecaca", fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },
     title: { fontSize: 34, fontWeight: "900", color: "#ffffff", textAlign: "center", letterSpacing: -0.5 },
     subtitle: { fontSize: 15, lineHeight: 23, color: "rgba(254,226,226,0.92)", textAlign: "center" },

     apartmentAlertCard: { borderRadius: 26, backgroundColor: "rgba(255,255,255,0.96)", padding: 16, gap: 10, borderWidth: 1, borderColor: "rgba(254,202,202,0.95)" },
     apartmentAlertHeader: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, borderRadius: 999, backgroundColor: "#b91c1c", paddingHorizontal: 12, paddingVertical: 8 },
     apartmentAlertLabel: { color: "#ffffff", fontSize: 12, fontWeight: "900", letterSpacing: 0.4 },
     apartmentLoadingText: { color: "#7f1d1d", fontSize: 16, fontWeight: "800" },
     apartmentTitle: { color: "#450a0a", fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
     apartmentMetaRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
     apartmentMetaLabel: { width: 72, color: "#b91c1c", fontSize: 13, fontWeight: "800" },
     apartmentMetaValue: { flex: 1, color: "#450a0a", fontSize: 14, lineHeight: 20, fontWeight: "700" },
     infoPanel: { borderRadius: 24, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 14, gap: 12 },
     infoHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
     infoHeaderText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
     infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
     infoCard: { width: "48.4%", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.09)", padding: 13, gap: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
     infoLabel: { fontSize: 12, fontWeight: "700", color: "#fecaca" },
     infoValue: { fontSize: 17, fontWeight: "900", color: "#ffffff" },
     warningCard: { flexDirection: "row", gap: 12, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(254,202,202,0.18)", padding: 15 },
     warningIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(239,68,68,0.72)", alignItems: "center", justifyContent: "center" },
     warningTextWrap: { flex: 1, gap: 4 },
     warningTitle: { fontSize: 15, fontWeight: "900", color: "#ffffff" },
     warningText: { fontSize: 13, lineHeight: 19, color: "#fee2e2" },
     primaryButton: { minHeight: 60, borderRadius: 20, backgroundColor: "#059669", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
     primaryButtonText: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
     actionsRow: { flexDirection: "row", gap: 10 },
     dangerButton: { flex: 1, minHeight: 56, borderRadius: 19, backgroundColor: "#dc2626", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
     supportButton: { flex: 1, minHeight: 56, borderRadius: 19, backgroundColor: "rgba(254,242,242,0.96)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(254,202,202,0.9)" },
     actionText: { fontSize: 15, fontWeight: "900", color: "#ffffff" },
     supportText: { fontSize: 15, fontWeight: "900", color: "#7f1d1d" },
     disabledButton: { opacity: 0.62 },
     buttonPressed: { opacity: 0.86 },
})
