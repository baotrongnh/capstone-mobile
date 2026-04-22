import { Colors } from "@/components/styles"
import { WIFI_DEVICE_URL } from "@/hooks/wifi/wifi-setup.constants"
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
            1. Mở cài đặt Wi-Fi trên điện thoại và kết nối mạng {requiredDeviceWifi}.
          </Text>
          <Text style={styles.modalStep}>
            2. Quay lại màn hình này, nhập tên và mật khẩu Wi-Fi nhà của bạn.
          </Text>
          <Text style={styles.modalStep}>
            3. Bấm Gửi cấu hình Wi-Fi để thiết bị tự kết nối mạng nhà.
          </Text>
          <Text style={styles.modalNote}>
            Với Android/Xiaomi, nếu đã vào đúng Wi-Fi nhưng ứng dụng vẫn báo lỗi, hãy tắt dữ liệu di động,
            Wi-Fi assistant hoặc Smart network switch. Sau đó thử mở {WIFI_DEVICE_URL} trong trình duyệt để
            xác nhận máy đang truy cập đúng vào ESP.
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
  modalNote: {
    color: "#1e3a8a",
    lineHeight: 20,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
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
