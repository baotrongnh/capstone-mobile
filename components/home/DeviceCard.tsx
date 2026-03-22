
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";

interface DeviceCardProps {
     icon: React.ReactNode;
     title: string;
     deviceCount: number;
     onToggle?: (value: boolean) => void;
     initial?: boolean;
}

export default function DeviceCard({
     icon,
     title,
     deviceCount,
     onToggle,
     initial = false,
}: DeviceCardProps) {
     const [isOn, setIsOn] = useState(initial);
     const anim = useRef(new Animated.Value(initial ? 1 : 0)).current;

     const toggleSwitch = () => {
          const newValue = !isOn;
          setIsOn(newValue);
          Animated.timing(anim, {
               toValue: newValue ? 1 : 0,
               duration: 180,
               useNativeDriver: false,
          }).start();
          onToggle?.(newValue);
     };

     const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 16],
     });

     return (
          <View style={styles.card}>
               <View style={styles.row}>
                    <View style={styles.icon}>{icon}</View>
                    <Pressable onPress={toggleSwitch} style={styles.switchWrap} hitSlop={8}>
                         <View style={[styles.track, isOn && styles.trackOn]}>
                              <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
                         </View>
                    </Pressable>
               </View>
               <Text style={styles.title}>{title}</Text>
               <Text style={styles.deviceCount}>{deviceCount} Device</Text>
          </View>
     );
}

const styles = StyleSheet.create({
     card: {
          flex: 1,
          backgroundColor: "#f3f4f6",
          borderRadius: 14,
          padding: 16,
          margin: 8,
          minHeight: 120,
          justifyContent: "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
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
     deviceCount: {
          fontSize: 12,
          color: "#6b7280",
     },
});