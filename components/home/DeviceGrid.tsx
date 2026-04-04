import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import DeviceCard from "./DeviceCard"
import { IotControlParams } from "@/lib/services/iot.service"

interface Device {
     id: string
     title: string
     deviceCount: number
     icon: string,
     topic: IotControlParams['topic']
}

interface DeviceGridProps {
     devices: Device[];
     onDeviceToggle?: (data: IotControlParams) => void
     espId: string
}

export default function DeviceGrid({ devices, onDeviceToggle, espId }: DeviceGridProps) {
     const renderItem = React.useCallback(
          ({ item }: { item: Device }) => (
               <View style={styles.item}>
                    <DeviceCard
                         icon={<MaterialCommunityIcons name={item.icon as any} size={32} color="#1f2937" />}
                         title={item.title}
                         onToggle={(isOn) => onDeviceToggle?.({
                              deviceId: item.id,
                              action: isOn ? "ON" : "OFF",
                              espId,
                              topic: item.topic
                         })}
                    />
               </View>
          ),
          [onDeviceToggle, espId],
     )

     return (
          <View>
               <FlatList
                    data={devices}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
               />
          </View>
     )
}

const styles = StyleSheet.create({
     row: {
          justifyContent: "space-between",
          marginBottom: 12,
     },
     item: {
          width: "48.5%",
     },
})