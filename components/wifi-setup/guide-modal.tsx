import { Colors } from "@/components/styles"
import React from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type GuideModalProps = {
  visible: boolean
  onClose: () => void
  requiredDeviceWifi: string
}

export function GuideModal({ visible, onClose, requiredDeviceWifi }: GuideModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Hướng dẫn nhanh</Text>
          <Text style={styles.modalStep}>
            1. Mở cài đặt Wi-Fi điện thoại và kết nối mạng {requiredDeviceWifi}.
          </Text>
          <Text style={styles.modalStep}>
            2. Quay lại màn hình này, nhập tên và mật khẩu Wi-Fi nhà của bạn.
          </Text>
          <Text style={styles.modalStep}>
            3. Bấm Gửi cấu hình Wi-Fi để thiết bị tự kết nối mạng nhà.
          </Text>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalStep: {
    color: "#334155",
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#ffffff",
    fontWeight: "700",
  },
})