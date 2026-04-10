import React from "react"
import { StyleSheet, Text, View } from "react-native"

type NetworkStatusCardProps = {
  isOnDeviceNetwork: boolean | null
  requiredDeviceWifi: string
}

export function NetworkStatusCard({
  isOnDeviceNetwork,
  requiredDeviceWifi,
}: NetworkStatusCardProps) {
  const isReady = isOnDeviceNetwork === true

  return (
    <View style={[styles.networkBox, isReady ? styles.networkBoxOk : styles.networkBoxWarn]}>
      <View style={styles.networkHead}>
        <Text style={styles.networkTitle}>Mạng thiết bị</Text>
        <View style={[styles.networkPill, isReady ? styles.networkPillOk : styles.networkPillWarn]}>
          <Text style={[styles.networkPillText, isReady ? styles.networkPillTextOk : styles.networkPillTextWarn]}>
            {isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
          </Text>
        </View>
      </View>

      <Text style={styles.networkText}>
        {isOnDeviceNetwork === null
          ? "Đang kiểm tra kết nối..."
          : isReady
            ? `Đang kết nối ${requiredDeviceWifi}`
            : `Chưa kết nối ${requiredDeviceWifi}`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  networkBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 2,
    gap: 8,
  },
  networkBoxOk: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  networkBoxWarn: {
    borderColor: "#fed7aa",
    backgroundColor: "#fff7ed",
  },
  networkHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  networkTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  networkPill: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  networkPillOk: {
    backgroundColor: "#dcfce7",
  },
  networkPillWarn: {
    backgroundColor: "#ffedd5",
  },
  networkPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  networkPillTextOk: {
    color: "#15803d",
  },
  networkPillTextWarn: {
    color: "#b45309",
  },
  networkText: {
    color: "#0f172a",
    fontWeight: "600",
  },
})