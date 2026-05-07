import { storage } from "@/stores/storage";
import { consumePendingNotificationRoute } from "@/utils/notificationDebug";
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true

    const checkAuthAndRedirect = async () => {
      try {
        
        const [accessToken, refreshToken, user, pendingNotificationRoute] = await Promise.all([
          storage.getItem("accessToken"),
          storage.getItem("refreshToken"),
          storage.getItem("user"),
          consumePendingNotificationRoute(),
        ])

        if (!isMounted) return

        if (accessToken && refreshToken && user) {
          router.replace((pendingNotificationRoute || "/(tabs)/home") as Href)
          return
        }

        router.replace("/login")
      } catch {
        if (!isMounted) return
        router.replace("/login")
      }
    }

    setTimeout(() => {
      checkAuthAndRedirect()
    }, 2000)

    return () => {
      isMounted = false
    }
  }, [router])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
})
