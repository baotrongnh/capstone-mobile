import { storage } from "@/stores/storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true

    const checkAuthAndRedirect = async () => {
      try {
        
        const [accessToken, refreshToken, user] = await Promise.all([
          storage.getItem("accessToken"),
          storage.getItem("refreshToken"),
          storage.getItem("user"),
        ])

        if (!isMounted) return

        router.replace(accessToken && refreshToken && user ? "/(tabs)/home" : "/login")
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
