import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capstone Mobile</Text>
      <Text style={styles.subtitle}>Chọn chức năng bạn muốn mở</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.navigate("/wifi-setup")}
      >
        <Text style={styles.buttonPrimaryText}>Kết nối Wi-Fi thiết bị</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.navigate("/(tabs)/home")}
      >
        <Text style={styles.buttonSecondaryText}>Vào trang Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.navigate("/login")}
      >
        <Text style={styles.buttonSecondaryText}>Đến trang đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.navigate("/contract")}
      >
        <Text style={styles.buttonSecondaryText}>Đến trang hợp đồng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    color: "#475569",
  },
  buttonPrimary: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonSecondary: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonSecondaryText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 15,
  },
});
