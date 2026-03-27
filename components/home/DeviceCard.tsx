
import React, { useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"

const ANIMATION_DURATION = 180
const THUMB_OFF_X = 1
const THUMB_ON_X = 16

interface DeviceCardProps {
     icon: React.ReactNode
     title: string
     onToggle?: (value: boolean) => void
     initial?: boolean
}

/**
 * Reusable device card with local on/off state and animated switch.
 * Keeps internal toggle behavior isolated and notifies parent via onToggle.
 */
export default function DeviceCard({
     icon,
     title,
     onToggle,
     initial = false,
}: DeviceCardProps) {
     const [isOn, setIsOn] = useState(initial)
     const anim = useRef(new Animated.Value(initial ? 1 : 0)).current

     const toggleSwitch = () => {
          const newValue = !isOn
          setIsOn(newValue)

          Animated.timing(anim, {
               toValue: newValue ? 1 : 0,
               duration: ANIMATION_DURATION,
               useNativeDriver: false,
          }).start()

          onToggle?.(newValue)
     }

     const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [THUMB_OFF_X, THUMB_ON_X],
     })

     return (
          <View style={[styles.card, isOn && styles.cardOn]}>
               <View style={styles.row}>
                    <View style={[styles.icon, isOn && styles.iconOn]}>{icon}</View>
                    <Pressable onPress={toggleSwitch} style={styles.switchWrap} hitSlop={8}>
                         <View style={[styles.track, isOn && styles.trackOn]}>
                              <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
                         </View>
                    </Pressable>
               </View>
               <Text style={[styles.title, isOn && styles.titleOn]}>{title}</Text>
               {/* Keep existing display behavior for easier integration with current module */}
               <Text style={[styles.deviceCount, isOn && styles.deviceCountOn]}>ID: test123</Text>
          </View>
     )
}

const styles = StyleSheet.create({
     card: {
          flex: 1,
          backgroundColor: "#f3f4f6",
          borderWidth: 1,
          borderColor: "#f3f4f6",
          borderRadius: 14,
          padding: 16,
          minHeight: 120,
          justifyContent: "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
     },
     cardOn: {
          backgroundColor: "#e8f0ff",
          borderColor: "#2563eb",
     },
     row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
     },
     icon: {
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 8,
          alignItems: "center",
          justifyContent: "center",
     },
     iconOn: {
          backgroundColor: "#dbeafe",
     },
     switchWrap: {
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
     },
     track: {
          width: 36,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#d1d5db",
          justifyContent: "center",
          padding: 2,
     },
     trackOn: {
          backgroundColor: "#2563eb",
     },
     thumb: {
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: "#fff",
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 2,
     },
     title: {
          fontSize: 15,
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: 2,
     },
     titleOn: {
          color: "#1d4ed8",
     },
     deviceCount: {
          fontSize: 12,
          color: "#6b7280",
     },
     deviceCountOn: {
          color: "#1e40af",
     },
})