import { useDeviceIot } from "@/hooks/query/useDevices"
import type { IoTControlVariables } from "@/lib/services/iot.service"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import {
     ActivityIndicator,
     Alert,
     Pressable,
     ScrollView,
     StatusBar,
     StyleSheet,
     Text,
     View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const BOARD_ID = "ESP_A101"
const DISCO_INTERVAL_MS = 1000
const DISCO_TOTAL_CYCLES = 5

const isMutationSuccess = (response?: { data?: { success?: boolean } }) =>
     Boolean(response?.data?.success)

const sleep = (ms: number) =>
     new Promise<void>((resolve) => {
          setTimeout(resolve, ms)
     })

type DebugDevice = {
     key: string
     label: string
     topic: IoTControlVariables["topic"]
     deviceId: number
}

const CONTROL_DEVICES: DebugDevice[] = [
     { key: "light-1", label: "Light 1", topic: "light", deviceId: 1 },
     { key: "light-2", label: "Light 2", topic: "light", deviceId: 2 },
     { key: "curtain-1", label: "Curtain 1", topic: "curtain", deviceId: 1 },
     { key: "alarm-1", label: "Alarm 1", topic: "alarm", deviceId: 1 },
     { key: "door-1", label: "Door 1", topic: "door", deviceId: 1 },
]

const DISCO_LIGHT_DEVICE_IDS = [1, 2]

export default function DebugScreen() {
     const { mutateAsync: toggleDeviceMutation } = useDeviceIot()

     const [statusText, setStatusText] = useState("Sẵn sàng")
     const [isDiscoRunning, setIsDiscoRunning] = useState(false)
     const [deviceLoadingMap, setDeviceLoadingMap] = useState<Record<string, boolean>>({})

     const mountedRef = useRef(true)
     const discoCancelRef = useRef(false)

     useEffect(() => {
          return () => {
               mountedRef.current = false
               discoCancelRef.current = true
          }
     }, [])

     const setDeviceLoading = (key: string, loading: boolean) => {
          setDeviceLoadingMap((prev) => ({
               ...prev,
               [key]: loading,
          }))
     }

     const getActionKey = (deviceKey: string, action: IoTControlVariables["action"]) => `${deviceKey}-${action}`

     const controlDevice = async ({
          topic,
          deviceId,
          action,
     }: {
          topic: IoTControlVariables["topic"]
          deviceId: number
          action: IoTControlVariables["action"]
     }) => {
          const response = await toggleDeviceMutation({
               espId: BOARD_ID,
               topic,
               deviceId,
               action,
          })

          return isMutationSuccess(response)
     }

     const ensureDiscoLightsOff = async () => {
          await Promise.allSettled(
               DISCO_LIGHT_DEVICE_IDS.map((deviceId) =>
                    controlDevice({
                         topic: "light",
                         deviceId,
                         action: "OFF",
                    }),
               ),
          )
     }

     const runAlarmAction = (
          device: DebugDevice,
          action: IoTControlVariables["action"],
          actionKey: string,
     ) => {
          setStatusText(`Đang gửi lệnh ${action} cho ${device.label}`)

          void toggleDeviceMutation({
               espId: BOARD_ID,
               topic: device.topic,
               deviceId: device.deviceId,
               action,
          })
               .then((response) => {
                    if (!isMutationSuccess(response)) {
                         Alert.alert("Thông báo", `${device.label} không phản hồi`)
                    }

                    if (mountedRef.current) {
                         setStatusText(`Đã gửi lệnh ${action} cho ${device.label}`)
                    }
               })
               .catch(() => {
                    Alert.alert("Lỗi", `Không thể gửi lệnh cho ${device.label}`)

                    if (mountedRef.current) {
                         setStatusText(`Lỗi khi gửi lệnh ${action} cho ${device.label}`)
                    }
               })
               .finally(() => {
                    if (mountedRef.current) {
                         setDeviceLoading(actionKey, false)
                    }
               })
     }

     const runDeviceAction = async (device: DebugDevice, action: IoTControlVariables["action"]) => {
          const actionKey = getActionKey(device.key, action)

          if (isDiscoRunning || deviceLoadingMap[actionKey]) {
               return
          }

          setDeviceLoading(actionKey, true)

          if (device.topic === "alarm") {
               runAlarmAction(device, action, actionKey)
               return
          }

          setStatusText(`Đang ${action} ${device.label}`)

          try {
               const success = await controlDevice({
                    topic: device.topic,
                    deviceId: device.deviceId,
                    action,
               })

               if (!success) {
                    Alert.alert("Thông báo", `${device.label} không phản hồi`)
                    return
               }

               if (mountedRef.current) {
                    setStatusText(`Đã ${action} ${device.label}`)
               }
          } catch {
               Alert.alert("Lỗi", `Không thể điều khiển ${device.label} lúc này`)
               if (mountedRef.current) {
                    setStatusText(`Lỗi khi ${action} ${device.label}`)
               }
          } finally {
               if (mountedRef.current) {
                    setDeviceLoading(actionKey, false)
               }
          }
     }

     const stopDisco = async () => {
          discoCancelRef.current = true
          setStatusText("Đang dừng Disco...")

          await ensureDiscoLightsOff()

          if (mountedRef.current) {
               setIsDiscoRunning(false)
               setStatusText("Đã dừng Disco")
          }
     }

     const runDisco = async () => {
          if (isDiscoRunning) {
               return
          }

          discoCancelRef.current = false
          setIsDiscoRunning(true)
          setStatusText("Disco đang chạy...")

          try {
               for (let cycle = 0; cycle < DISCO_TOTAL_CYCLES; cycle += 1) {
                    if (discoCancelRef.current) {
                         break
                    }

                    await Promise.allSettled(
                         DISCO_LIGHT_DEVICE_IDS.map((deviceId) =>
                              controlDevice({
                                   topic: "light",
                                   deviceId,
                                   action: "ON",
                              }),
                         ),
                    )

                    await sleep(DISCO_INTERVAL_MS)

                    if (discoCancelRef.current) {
                         break
                    }

                    await Promise.allSettled(
                         DISCO_LIGHT_DEVICE_IDS.map((deviceId) =>
                              controlDevice({
                                   topic: "light",
                                   deviceId,
                                   action: "OFF",
                              }),
                         ),
                    )

                    if (cycle < DISCO_TOTAL_CYCLES - 1) {
                         await sleep(DISCO_INTERVAL_MS)
                    }
               }

               await ensureDiscoLightsOff()

               if (mountedRef.current) {
                    setStatusText(discoCancelRef.current ? "Đã dừng Disco" : "Hoàn tất Disco (5 lần)")
               }
          } catch {
               await ensureDiscoLightsOff()
               Alert.alert("Lỗi", "Disco mode gặp lỗi khi gọi API")
               if (mountedRef.current) {
                    setStatusText("Disco gặp lỗi")
               }
          } finally {
               if (mountedRef.current) {
                    setIsDiscoRunning(false)
               }
          }
     }

     return (
          <SafeAreaView style={styles.container}>
               <Stack.Screen options={{ headerShown: false }} />
               <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

               <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                         <Pressable onPress={router.back} style={styles.backButton}>
                              <MaterialIcons name="arrow-back" size={22} color="#334155" />
                         </Pressable>

                         <View style={styles.headerTextWrap}>
                              <Text style={styles.headerTitle}>Debug thiết bị</Text>
                              <Text style={styles.headerSubtitle}>Board cố định: {BOARD_ID}</Text>
                         </View>
                    </View>

                    <View style={styles.discoCard}>
                         <View style={styles.discoInfoRow}>
                              <View style={styles.discoIconWrap}>
                                   <MaterialCommunityIcons name="party-popper" size={20} color="#1d4ed8" />
                              </View>
                              <View style={styles.discoTextWrap}>
                                   <Text style={styles.discoTitle}>Disco mode</Text>
                                   <Text style={styles.discoSubtitle}>Nháy Light 1 + Light 2 trong 5 lần, mỗi nhịp cách 1 giây</Text>
                              </View>
                         </View>

                         <Pressable
                              onPress={() => {
                                   if (isDiscoRunning) {
                                        void stopDisco()
                                        return
                                   }

                                   void runDisco()
                              }}
                              style={({ pressed }) => [
                                   styles.discoButton,
                                   isDiscoRunning && styles.discoButtonStop,
                                   pressed && styles.buttonPressed,
                              ]}
                         >
                              <Text style={styles.discoButtonText}>{isDiscoRunning ? "Tắt Disco" : "Bật Disco"}</Text>
                         </Pressable>
                    </View>

                    <View style={styles.sectionHeader}>
                         <Text style={styles.sectionTitle}>Điều khiển từng thiết bị</Text>
                         <Text style={styles.sectionSubtitle}>Mỗi thiết bị có nút Bật và Tắt riêng (riêng cửa chỉ có Bật)</Text>
                    </View>

                    <View style={styles.grid}>
                         {CONTROL_DEVICES.map((device) => {
                              const onKey = getActionKey(device.key, "ON")
                              const offKey = getActionKey(device.key, "OFF")
                              const isOnLoading = Boolean(deviceLoadingMap[onKey])
                              const isOffLoading = Boolean(deviceLoadingMap[offKey])
                              const isDoor = device.topic === "door"
                              const isDeviceBusy = isOnLoading || isOffLoading
                              const disableOn = isDiscoRunning || isDeviceBusy
                              const disableOff = isDiscoRunning || isDeviceBusy

                              return (
                                   <View key={device.key} style={[styles.deviceButton, isDiscoRunning && styles.deviceButtonDisabled]}>
                                        <Text style={styles.deviceButtonLabel}>{device.label}</Text>
                                        <Text style={styles.deviceButtonMeta}>{device.topic} - {device.deviceId}</Text>

                                        <View style={styles.deviceActionsRow}>
                                             <Pressable
                                                  disabled={disableOn}
                                                  onPress={() => {
                                                       void runDeviceAction(device, "ON")
                                                  }}
                                                  style={({ pressed }) => [
                                                       styles.actionButton,
                                                       disableOn && styles.actionButtonDisabled,
                                                       pressed && styles.buttonPressed,
                                                  ]}
                                             >
                                                  {isOnLoading ? (
                                                       <ActivityIndicator size="small" color="#1d4ed8" />
                                                  ) : (
                                                       <Text style={styles.actionButtonOnText}>Bật</Text>
                                                  )}
                                             </Pressable>

                                             {!isDoor && (
                                                  <Pressable
                                                       disabled={disableOff}
                                                       onPress={() => {
                                                            void runDeviceAction(device, "OFF")
                                                       }}
                                                       style={({ pressed }) => [
                                                            styles.actionButton,
                                                            styles.actionButtonOff,
                                                            disableOff && styles.actionButtonDisabled,
                                                            pressed && styles.buttonPressed,
                                                       ]}
                                                  >
                                                       {isOffLoading ? (
                                                            <ActivityIndicator size="small" color="#b91c1c" />
                                                       ) : (
                                                            <Text style={styles.actionButtonOffText}>Tắt</Text>
                                                       )}
                                                  </Pressable>
                                             )}
                                        </View>

                                        {device.topic === "alarm" ? (
                                             <Text style={styles.deviceHint}>Báo động: gửi lệnh ngay, không chờ trạng thái phản hồi</Text>
                                        ) : null}
                                   </View>
                              )
                         })}
                    </View>

                    <View style={styles.statusCard}>
                         <Text style={styles.statusLabel}>Trạng thái</Text>
                         <Text style={styles.statusText}>{statusText}</Text>
                    </View>
               </ScrollView>
          </SafeAreaView>
     )
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: "#f8fafc",
     },
     content: {
          padding: 16,
          paddingBottom: 32,
          gap: 12,
     },
     header: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
     },
     backButton: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#e2e8f0",
     },
     headerTextWrap: {
          flex: 1,
          gap: 2,
     },
     headerTitle: {
          fontSize: 24,
          fontWeight: "700",
          color: "#0f172a",
     },
     headerSubtitle: {
          fontSize: 13,
          color: "#64748b",
     },
     discoCard: {
          backgroundColor: "#ffffff",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#dbeafe",
          padding: 14,
          gap: 12,
     },
     discoInfoRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     discoIconWrap: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "#eff6ff",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#dbeafe",
     },
     discoTextWrap: {
          flex: 1,
          gap: 2,
     },
     discoTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: "#0f172a",
     },
     discoSubtitle: {
          fontSize: 12,
          color: "#64748b",
          lineHeight: 18,
     },
     discoButton: {
          minHeight: 44,
          borderRadius: 12,
          backgroundColor: "#dbeafe",
          alignItems: "center",
          justifyContent: "center",
     },
     discoButtonStop: {
          backgroundColor: "#fee2e2",
     },
     discoButtonText: {
          fontSize: 14,
          fontWeight: "700",
          color: "#1d4ed8",
     },
     sectionHeader: {
          gap: 2,
          marginTop: 2,
     },
     sectionTitle: {
          fontSize: 16,
          fontWeight: "700",
          color: "#0f172a",
     },
     sectionSubtitle: {
          fontSize: 12,
          color: "#64748b",
     },
     grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 10,
     },
     deviceButton: {
          width: "48.3%",
          minHeight: 108,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          paddingHorizontal: 12,
          paddingVertical: 11,
          gap: 8,
     },
     deviceButtonDisabled: {
          opacity: 0.65,
     },
     deviceButtonLabel: {
          fontSize: 14,
          fontWeight: "700",
          color: "#0f172a",
     },
     deviceButtonMeta: {
          fontSize: 12,
          color: "#64748b",
     },
     deviceActionsRow: {
          flexDirection: "row",
          gap: 8,
     },
     actionButton: {
          flex: 1,
          minHeight: 34,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#bfdbfe",
          backgroundColor: "#dbeafe",
          alignItems: "center",
          justifyContent: "center",
     },
     actionButtonOff: {
          borderColor: "#fecaca",
          backgroundColor: "#fee2e2",
     },
     actionButtonDisabled: {
          opacity: 0.6,
     },
     actionButtonOnText: {
          fontSize: 12,
          fontWeight: "700",
          color: "#1d4ed8",
     },
     actionButtonOffText: {
          fontSize: 12,
          fontWeight: "700",
          color: "#b91c1c",
     },
     deviceHint: {
          fontSize: 11,
          lineHeight: 15,
          color: "#64748b",
     },
     statusCard: {
          backgroundColor: "#ffffff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 3,
     },
     statusLabel: {
          fontSize: 12,
          color: "#64748b",
          fontWeight: "600",
     },
     statusText: {
          fontSize: 13,
          color: "#334155",
          fontWeight: "600",
     },
     buttonPressed: {
          opacity: 0.84,
     },
})
