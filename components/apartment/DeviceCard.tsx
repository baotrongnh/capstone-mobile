import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"

interface DeviceCardProps {
     iconName: keyof typeof MaterialCommunityIcons.glyphMap
     title: string
     subtitle?: string
     onToggle?: (value: boolean) => void
     initial?: boolean
}

export default function DeviceCard({
     iconName,
     title,
     subtitle,
     onToggle,
     initial = false,
}: DeviceCardProps) {
     const [isOn, setIsOn] = useState(initial)
     const switchAnim = useRef(new Animated.Value(initial ? 20 : 0)).current

     const toggleSwitch = () => {
          const nextValue = !isOn
          setIsOn(nextValue)

          Animated.spring(switchAnim, {
               toValue: nextValue ? 20 : 0,
               damping: 16,
               stiffness: 240,
               mass: 0.8,
               useNativeDriver: true,
          }).start()

          onToggle?.(nextValue)
     }

     return (
          <View style={[styles.card, isOn && styles.cardOn]}>
               <View style={styles.row}>
                    <View style={[styles.iconWrap, isOn && styles.iconWrapOn]}>
                         <MaterialCommunityIcons
                              name={iconName}
                              size={22}
                              color={isOn ? "#1d4ed8" : "#334155"}
                         />
                    </View>

                    <Pressable onPress={toggleSwitch} style={styles.switchWrap} hitSlop={8}>
                         <View style={[styles.track, isOn && styles.trackOn]}>
                              <Animated.View style={[styles.thumb, { transform: [{ translateX: switchAnim }] }]} />
                         </View>
                    </Pressable>
               </View>

               <Text numberOfLines={1} style={styles.title}>{title}</Text>
               {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
               <Text style={[styles.statusText, isOn && styles.statusTextOn]}>
                    {isOn ? "Đang bật" : "Đang tắt"}
               </Text>
          </View>
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
     switchWrap: {
          padding: 2,
     },
     track: {
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#cbd5e1",
          padding: 3,
          justifyContent: "center",
     },
     trackOn: {
          backgroundColor: "#3b82f6",
     },
     thumb: {
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#ffffff",
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