import { useApartment } from "@/hooks/query/useApartments"
import { iotServices } from "@/lib/services/iot.service"
import type { IoTControlRequestBody } from "@/lib/services/iot.service"
import { clearPendingNotificationRoute } from "@/utils/notificationDebug"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo, useState } from "react"
import { Alert, Linking, Pressable, StatusBar, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const EMERGENCY_PHONE = "114"
const SUPPORT_PHONE = "0332667829"

const TEXT = {
     unknown: "Không xác định",
     noAddress: "Chưa có địa chỉ",
     unknownFloor: "Không rõ",
     cannotCall: "Không thể gọi",
     callDirectly: "Vui lòng gọi trực tiếp số",
     urgent: "KHẨN CẤP",
     title: "Cảnh báo cháy",
     subtitle: "Kiểm tra an toàn trước khi tắt còi báo động.",
     apartmentAlert: "Căn hộ đang báo cháy",
     loadingApartment: "Đang tải thông tin căn hộ...",
     apartmentCode: "Căn hộ",
     floor: "Tầng",
     address: "Địa chỉ",
     safetyText: "Rời khỏi khu vực nguy hiểm và chỉ tắt báo cháy khi đã an toàn.",
     turnOff: "Tắt báo cháy",
     turnedOff: "Đã tắt báo cháy",
     callEmergency: "Gọi 114",
     callManager: "Ban quản lý"
}

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
               apartmentId: apartmentId || TEXT.unknown,
          }
     }, [apartmentId, params.action, params.deviceId, params.deviceTopic, params.espId])

     const apartmentTitle = apartment?.apartmentNumber ? TEXT.apartmentCode + " " + apartment.apartmentNumber : alarmPayload.apartmentId
     const apartmentAddress = joinAddress(apartment?.streetAddress, apartment?.fullAddress) || apartment?.buildingName || TEXT.noAddress
     const apartmentFloor = typeof apartment?.floorNumber === "number" ? String(apartment.floorNumber) : TEXT.unknownFloor

     const callPhone = async (phone: string) => {
          const phoneUrl = "tel:" + phone
          try {
               const supported = await Linking.canOpenURL(phoneUrl)
               if (!supported) {
                    Alert.alert(TEXT.cannotCall, TEXT.callDirectly + " " + phone)
                    return
               }
               await Linking.openURL(phoneUrl)
          } catch {
               Alert.alert(TEXT.cannotCall, TEXT.callDirectly + " " + phone)
          }
     }

     const turnOffAlarm = () => {
          if (isAlarmOffSent) return
          setIsAlarmOffSent(true)
          void iotServices.deviceControl({
               espId: alarmPayload.espId,
               deviceId: alarmPayload.deviceId,
               topic: alarmPayload.topic,
               action: alarmPayload.action,
          }).catch(() => undefined)
     }

     const goHome = () => {
          void clearPendingNotificationRoute()
          router.replace("/(tabs)/home")
     }

     return (
          <SafeAreaView style={styles.container}>
               <Stack.Screen options={{ headerShown: false }} />
               <StatusBar barStyle="light-content" backgroundColor="#2b0708" />

               <View style={styles.content}>
                    <View style={styles.glowTop} />
                    <View style={styles.glowBottom} />

                    <View style={styles.topBar}>
                         <Pressable onPress={goHome} style={styles.backButton}>
                              <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
                         </Pressable>
                         <View style={styles.urgentBadge}>
                              <View style={styles.urgentDot} />
                              <Text style={styles.urgentText}>{TEXT.urgent}</Text>
                         </View>
                    </View>

                    <View style={styles.mainCard}>
                         <View style={styles.fireIconWrap}>
                              <MaterialCommunityIcons name="fire-alert" size={54} color="#ffffff" />
                         </View>
                         <Text style={styles.title}>{TEXT.title}</Text>
                         <Text style={styles.subtitle}>{TEXT.subtitle}</Text>

                         <View style={styles.apartmentCard}>
                              <Text style={styles.apartmentLabel}>{TEXT.apartmentAlert}</Text>
                              <Text style={styles.apartmentTitle}>{isApartmentLoading ? TEXT.loadingApartment : apartmentTitle}</Text>
                              <View style={styles.metaRow}>
                                   <Text style={styles.metaText}>{TEXT.floor}: {apartmentFloor}</Text>
                                   <View style={styles.metaDot} />
                                   <Text numberOfLines={2} style={styles.addressText}>{isApartmentLoading ? "..." : apartmentAddress}</Text>
                              </View>
                         </View>

                         <View style={styles.safetyRow}>
                              <MaterialCommunityIcons name="shield-alert-outline" size={19} color="#fecaca" />
                              <Text style={styles.safetyText}>{TEXT.safetyText}</Text>
                         </View>

                         <Pressable disabled={isAlarmOffSent} onPress={turnOffAlarm} style={({ pressed }) => [styles.primaryButton, isAlarmOffSent && styles.disabledButton, pressed && styles.buttonPressed]}>
                              <MaterialCommunityIcons name="alarm-light-off-outline" size={24} color="#ffffff" />
                              <Text style={styles.primaryButtonText}>{isAlarmOffSent ? TEXT.turnedOff : TEXT.turnOff}</Text>
                         </Pressable>
                    </View>

                    <View style={styles.actionsRow}>
                         <Pressable onPress={() => void callPhone(EMERGENCY_PHONE)} style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}>
                              <MaterialCommunityIcons name="phone-alert-outline" size={21} color="#ffffff" />
                              <Text style={styles.dangerButtonText}>{TEXT.callEmergency}</Text>
                         </Pressable>
                         <Pressable onPress={() => void callPhone(SUPPORT_PHONE)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
                              <MaterialCommunityIcons name="account-tie-voice-outline" size={21} color="#7f1d1d" />
                              <Text style={styles.secondaryButtonText}>{TEXT.callManager}</Text>
                         </Pressable>
                    </View>
               </View>
          </SafeAreaView>
     )
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: "#2b0708",
     },
     content: {
          flex: 1,
          padding: 18,
          gap: 12,
          justifyContent: "space-between",
          overflow: "hidden",
     },
     glowTop: {
          position: "absolute",
          top: -120,
          right: -90,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: "rgba(248,113,113,0.20)",
     },
     glowBottom: {
          position: "absolute",
          bottom: -110,
          left: -110,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(127,29,29,0.42)",
     },
     topBar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
     },
     backButton: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "rgba(255,255,255,0.10)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          alignItems: "center",
          justifyContent: "center",
     },
     urgentBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          backgroundColor: "#fef2f2",
          paddingHorizontal: 13,
          paddingVertical: 8,
     },
     urgentDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#dc2626",
     },
     urgentText: {
          color: "#991b1b",
          fontSize: 12,
          fontWeight: "900",
          letterSpacing: 1,
     },
     mainCard: {
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.09)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          padding: 18,
          alignItems: "center",
          gap: 12,
     },
     fireIconWrap: {
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: "#ef4444",
          borderWidth: 8,
          borderColor: "rgba(254,202,202,0.22)",
          alignItems: "center",
          justifyContent: "center",
     },
     title: {
          fontSize: 31,
          fontWeight: "900",
          color: "#ffffff",
          textAlign: "center",
          letterSpacing: -0.4,
     },
     subtitle: {
          marginTop: -4,
          fontSize: 14,
          lineHeight: 20,
          color: "#fee2e2",
          textAlign: "center",
     },
     apartmentCard: {
          alignSelf: "stretch",
          borderRadius: 22,
          backgroundColor: "#fff7f7",
          borderWidth: 1,
          borderColor: "#fecaca",
          padding: 14,
          gap: 8,
     },
     apartmentLabel: {
          color: "#b91c1c",
          fontSize: 12,
          fontWeight: "900",
          letterSpacing: 0.6,
          textTransform: "uppercase",
     },
     apartmentTitle: {
          color: "#450a0a",
          fontSize: 22,
          fontWeight: "900",
     },
     metaRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
     },
     metaText: {
          color: "#7f1d1d",
          fontSize: 13,
          fontWeight: "800",
     },
     metaDot: {
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#ef4444",
     },
     addressText: {
          flex: 1,
          color: "#7f1d1d",
          fontSize: 13,
          lineHeight: 18,
          fontWeight: "700",
     },
     safetyRow: {
          alignSelf: "stretch",
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-start",
     },
     safetyText: {
          flex: 1,
          color: "#fee2e2",
          fontSize: 13,
          lineHeight: 18,
          fontWeight: "600",
     },
     primaryButton: {
          alignSelf: "stretch",
          minHeight: 62,
          borderRadius: 20,
          backgroundColor: "#059669",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
     },
     primaryButtonText: {
          fontSize: 17,
          fontWeight: "900",
          color: "#ffffff",
     },
     actionsRow: {
          flexDirection: "row",
          gap: 10,
     },
     dangerButton: {
          flex: 1,
          minHeight: 54,
          borderRadius: 18,
          backgroundColor: "#dc2626",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
     },
     secondaryButton: {
          flex: 1,
          minHeight: 54,
          borderRadius: 18,
          backgroundColor: "#fee2e2",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
     },
     dangerButtonText: {
          fontSize: 14,
          fontWeight: "900",
          color: "#ffffff",
     },
     secondaryButtonText: {
          fontSize: 14,
          fontWeight: "900",
          color: "#7f1d1d",
     },
     disabledButton: {
          opacity: 0.62,
     },
     buttonPressed: {
          opacity: 0.86,
     },
})
