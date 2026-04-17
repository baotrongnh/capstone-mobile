import { Colors } from "@/components/styles"
import React from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

type WifiFormCardProps = {
  ssid: string
  password: string
  showPassword: boolean
  isBusy: boolean
  canSubmit: boolean
  isCheckingNetwork: boolean
  requiredDeviceWifi: string
  onChangeSsid: (value: string) => void
  onChangePassword: (value: string) => void
  onTogglePassword: () => void
  onSubmit: () => void
  onCheckNetwork: () => void
}

export function WifiFormCard({
  ssid,
  password,
  showPassword,
  isBusy,
  canSubmit,
  isCheckingNetwork,
  requiredDeviceWifi,
  onChangeSsid,
  onChangePassword,
  onTogglePassword,
  onSubmit,
  onCheckNetwork,
}: WifiFormCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Tên Wi-Fi (SSID)</Text>
      <TextInput
        value={ssid}
        onChangeText={onChangeSsid}
        placeholder="Ví dụ: Home_Wifi_5G"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />

      <Text style={styles.label}>Mật khẩu Wi-Fi</Text>
      <View style={styles.passwordWrap}>
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          placeholder="Nhập mật khẩu"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={onTogglePassword} style={styles.togglePasswordBtn}>
          <Text style={styles.togglePasswordText}>{showPassword ? "Ẩn" : "Hiện"}</Text>
        </Pressable>
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!canSubmit}
        style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
      >
        {isBusy ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>Gửi cấu hình Wi-Fi</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCheckNetwork}
        disabled={isCheckingNetwork}
        style={[styles.secondaryButton, isCheckingNetwork && styles.buttonDisabled]}
      >
        {isCheckingNetwork ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={styles.secondaryButtonText}>Kiểm tra {requiredDeviceWifi}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        Thiết bị chỉ nhận cấu hình khi điện thoại đang ở mạng {requiredDeviceWifi}.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 54,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  togglePasswordBtn: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  togglePasswordText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "#eff6ff",
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  helperText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})