import { IoTControlVariables } from "@/lib/services/iot.service"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, Text, View } from "react-native"
import DeviceCard from "./DeviceCard"
import DoorAccessCard from "./DoorAccessCard"

export interface DeviceGridItem {
     id: string
     espId?: string
     deviceId: number
     title: string
     subtitle?: string
     icon: keyof typeof MaterialCommunityIcons.glyphMap
     topic: IoTControlVariables["topic"]
     initial?: boolean
}

interface DeviceGridProps {
     devices: DeviceGridItem[]
     onDeviceToggle?: (data: IoTControlVariables) => void
     espId: string
     onOpenDoor: () => void
}

export default function DeviceGrid({ devices, onDeviceToggle, espId, onOpenDoor }: DeviceGridProps) {
     return (
          <>
               <View style={styles.grid}>
                    {devices.map((item) => (
                         <View key={item.id} style={styles.item}>
                              <DeviceCard
                                   iconName={item.icon}
                                   title={item.title}
                                   subtitle={item.subtitle}
                                   initial={item.initial}
                                   onToggle={(isOn) =>
                                        onDeviceToggle?.({
                                             deviceId: item.deviceId,
                                             action: isOn ? "ON" : "OFF",
                                             espId: item.espId ?? espId,
                                             topic: item.topic,
                                        })
                                   }
                              />
                         </View>
                    ))}
               </View>

               <View style={styles.sectionBlock}>
                    <Text style={styles.sectionTitle}>Cửa ra vào</Text>
                    <DoorAccessCard title="Mở cửa chính" onOpenDoor={onOpenDoor} />
               </View>
          </>
     )
}

const styles = StyleSheet.create({
     grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
     },
     item: {
          width: "48.2%",
     },
     sectionBlock: {
          gap: 10,
     },
     sectionTitle: {
          fontSize: 19,
          fontWeight: '700',
          color: '#0f172a',
     },
})