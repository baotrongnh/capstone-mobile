import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { StyledContainer } from "@/components/styles"
import { useRouter } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

type MoreAction = {
     id: string
     title: string
     icon: keyof typeof MaterialCommunityIcons.glyphMap
}

const actions: MoreAction[] = [
     { id: "support", title: "Hỗ trợ cư dân", icon: "lifebuoy" },
     { id: "payments", title: "Thanh toán nhanh", icon: "cash-multiple" },
     { id: "documents", title: "Tài liệu nội bộ", icon: "file-document-outline" },
     { id: "feedback", title: "Góp ý ứng dụng", icon: "message-text-outline" },
]

export default function MoreScreen() {
     const router = useRouter()

     return (
          <StyledContainer style={styles.container}>
               <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                         <Ionicons name="chevron-back" size={24} color="#334155" />
                    </Pressable>
                    <Text style={styles.title}>Xem thêm</Text>
               </View>

               <View style={styles.list}>
                    {actions.map((item) => (
                         <Pressable key={item.id} style={styles.item}>
                              <View style={styles.iconWrap}>
                                   <MaterialCommunityIcons name={item.icon} size={20} color="#3b82f6" />
                              </View>
                              <Text style={styles.itemText}>{item.title}</Text>
                              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                         </Pressable>
                    ))}
               </View>
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: "#f3f5f9",
          paddingHorizontal: 20,
     },
     header: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
     },
     backButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
     },
     title: {
          fontSize: 22,
          fontWeight: "700",
          color: "#0f172a",
     },
     list: {
          gap: 10,
     },
     item: {
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          paddingVertical: 14,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
     },
     iconWrap: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#eff6ff",
          alignItems: "center",
          justifyContent: "center",
     },
     itemText: {
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: "#0f172a",
     },
})
