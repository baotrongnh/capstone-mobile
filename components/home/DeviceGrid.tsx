import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import DeviceCard from "./DeviceCard"

interface Device {
     id: string
     title: string
     deviceCount: number
     icon: string
}

interface DeviceGridProps {
     devices: Device[];
     onDeviceToggle?: (deviceId: string, action: string) => void
}

export default function DeviceGrid({ devices, onDeviceToggle }: DeviceGridProps) {
     const renderItem = React.useCallback(
          ({ item }: { item: Device }) => (
               <View style={styles.item}>
                    <DeviceCard
                         icon={<MaterialCommunityIcons name={item.icon as any} size={32} color="#1f2937" />}
                         title={item.title}
                         onToggle={(isOn) => onDeviceToggle?.(item.id, isOn ? "on" : "off")}
                    />
               </View>
          ),
          [onDeviceToggle],
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