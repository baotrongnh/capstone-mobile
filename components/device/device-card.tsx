import { MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"

interface DeviceCardProps {
     iconName: keyof typeof MaterialCommunityIcons.glyphMap
     title: string
     subtitle?: string
     isOn: boolean
     onToggle?: (nextValue: boolean) => void | Promise<void>
     onLongPress?: () => void
     loading?: boolean
     disabled?: boolean
     topic: string
}

export default function DeviceCard({
     iconName,
     title,
     subtitle,
     isOn,
     onToggle,
     onLongPress,
     loading = false,
     disabled = false,
     topic

}: DeviceCardProps) {
     const toggleSwitch = () => {
          if (loading || disabled) return

          onToggle?.(!isOn)
     }

     return (
          <Pressable onLongPress={onLongPress} delayLongPress={350}>
               {({ pressed }) => (
                    <View style={[styles.card, isOn && styles.cardOn, (disabled || loading) && styles.cardDisabled, pressed && styles.cardPressed]}>
                         <View style={styles.row}>
                              <View style={[styles.iconWrap, isOn && styles.iconWrapOn]}>
                                   <MaterialCommunityIcons
                                        name={iconName}
                                        size={22}
                                        color={isOn ? "#1d4ed8" : "#334155"}
                                   />
                              </View>

                              {loading ? (
                                   <View style={styles.powerButtonLoading}>
                                        <ActivityIndicator size="small" color="#ffffff" />
                                   </View>
                              ) : (
                                   <Pressable
                                        onPress={toggleSwitch}
                                        style={[
                                             styles.powerButton,
                                             isOn ? styles.powerButtonOn : styles.powerButtonOff,
                                             disabled && styles.powerButtonDisabled,
                                        ]}
                                        hitSlop={8}
                                        disabled={disabled}
                                   >
                                        <MaterialCommunityIcons name="power" size={20} color="#fff" />
                                   </Pressable>
                              )}
                         </View>

                         <Text numberOfLines={1} style={styles.title}>{title}</Text>
                         {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
                         <Text style={[styles.statusText, isOn && styles.statusTextOn]}>
                              {loading ? "Đang xử lý..." : isOn ?
                                   (topic === 'curtain' ? 'Đang mở' : "Đang bật") :
                                   (topic === 'curtain' ? 'Đang đóng' : "Đang tắt")
                              }
                         </Text>
                    </View>
               )}
          </Pressable>
     )
}

const styles = StyleSheet.create({
     card: {
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          padding: 14,
          height: 154,
          justifyContent: "flex-start",
     },
     cardOn: {
          borderColor: "#bfdbfe",
          backgroundColor: "#eff6ff",
     },
     cardPressed: {
          opacity: 0.78,
     },
     cardDisabled: {
          opacity: 0.55,
     },
     row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
     },
     iconWrap: {
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
     },
     iconWrapOn: {
          backgroundColor: "#dbeafe",
     },
     powerButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          elevation: 2,
          shadowColor: "#1d4ed8",
          shadowOpacity: 0.2,
          shadowRadius: 6,
     },
     powerButtonOn: {
          backgroundColor: "#3b82f6",
     },
     powerButtonOff: {
          backgroundColor: "#94a3b8",
     },
     powerButtonDisabled: {
          opacity: 0.75,
     },
     powerButtonLoading: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#2563eb",
          alignItems: "center",
          justifyContent: "center",
     },
     title: {
          minHeight: 24,
          fontSize: 17,
          fontWeight: "700",
          color: "#0f172a",
     },
     subtitle: {
          marginTop: 4,
          minHeight: 18,
          fontSize: 12,
          color: "#64748b",
     },
     statusText: {
          marginTop: "auto",
          fontSize: 12,
          color: "#64748b",
          fontWeight: "600",
     },
     statusTextOn: {
          color: "#2563eb",
     },
})