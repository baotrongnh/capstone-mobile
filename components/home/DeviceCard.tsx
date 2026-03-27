
import React, { useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"

const ANIMATION_DURATION = 180
const THUMB_OFF_X = 1
const THUMB_ON_X = 18

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
          backgroundColor: "#f8fafc",
          borderWidth: 1,
          borderColor: "#dbe7ff",
          borderRadius: 16,
          padding: 18,
          minHeight: 126,
          justifyContent: "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
     },
     cardOn: {
          backgroundColor: "#eff6ff",
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
          borderRadius: 24,
          padding: 10,
          alignItems: "center",
          justifyContent: "center",
     },
     iconOn: {
          backgroundColor: "#dbeafe",
     },
     switchWrap: {
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
     },
     track: {
          width: 42,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#cbd5e1",
          justifyContent: "center",
          padding: 2,
     },
     trackOn: {
          backgroundColor: "#2563eb",
     },
     thumb: {
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 2,
     },
     title: {
          fontSize: 16,
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: 4,
     },
     titleOn: {
          color: "#1d4ed8",
     },
     deviceCount: {
          fontSize: 13,
          color: "#475569",
     },
     deviceCountOn: {
          color: "#1e40af",
     },
})