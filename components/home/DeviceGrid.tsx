import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import DeviceCard from "./DeviceCard";

interface Device {
     id: string;
     title: string;
     deviceCount: number;
     icon: string;
}

interface DeviceGridProps {
     devices: Device[];
     onDeviceToggle?: (deviceId: string, isOn: boolean) => void;
}

export default function DeviceGrid({ devices, onDeviceToggle }: DeviceGridProps) {
     return (
          <View style={styles.container}>
               <FlatList
                    data={devices}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                         <DeviceCard
                              icon={<MaterialCommunityIcons name={item.icon as any} size={32} color="#1f2937" />}
                              title={item.title}
                              deviceCount={item.deviceCount}
                              onToggle={(isOn) => onDeviceToggle?.(item.id, isOn)}
                         />
                    )}
                    scrollEnabled={false}
               />
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          paddingHorizontal: 8,
     },
});