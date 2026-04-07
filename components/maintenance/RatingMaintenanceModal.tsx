import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRateMaintenanceRequest } from "@/hooks/query/useMaintenance";

interface ModalRatingMaintenanceProps {
  open: boolean;
  onClose: () => void;
  id: string;
}

export default function ModalRatingMaintenance({
  open,
  onClose,
  id,
}: ModalRatingMaintenanceProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { mutateAsync: rateMaintenanceRequest } = useRateMaintenanceRequest(id);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Vui lòng chọn mức đánh giá");
      return;
    }

    const payload = {
      rating,
      feedback,
    };

    setLoading(true);
    try {
      await rateMaintenanceRequest(payload);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Lỗi khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setFeedback("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={open} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đánh giá dịch vụ</Text>
            <Pressable onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.label}>Mê thích dịch vụ?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <MaterialCommunityIcons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#fbbf24" : "#cbd5e1"}
                    />
                  </Pressable>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  Bạn đánh giá:{" "}
                  <Text style={styles.ratingValue}>{rating}/5 sao</Text>
                </Text>
              )}
            </View>

            {/* Feedback Text Input */}
            <View style={styles.feedbackSection}>
              <Text style={styles.label}>Góp ý của bạn</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                placeholderTextColor="#94a3b8"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{feedback.length}/500</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.submitButton,
                (loading || rating === 0) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  ratingSection: {
    marginBottom: 24,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
  },
  ratingValue: {
    fontWeight: "700",
    color: "#1f2937",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    maxHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  submitButton: {
    backgroundColor: "#10b981",
  },
  buttonDisabled: {
    backgroundColor: "#cbd5e1",
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
