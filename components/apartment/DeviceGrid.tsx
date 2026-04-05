import React from "react"
import { StyleSheet, View } from "react-native"
import DeviceCard from "./DeviceCard"
import { IotControlParams, IoTControlVariables } from "@/lib/services/iot.service"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export interface DeviceGridItem {
     id: string
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
}

export default function DeviceGrid({ devices, onDeviceToggle, espId }: DeviceGridProps) {
     return (
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
                                        espId,
                                        topic: item.topic,
                                   })
                              }
                         />
                    </View>
               ))}
          </View>
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
})