import { Colors } from "@/components/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MaintenanceRequestUI {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  apartment: string;
  assignedTo: string | null;
  room: string | null;
  isRated?: boolean;
}

interface MaintenanceRequestCardProps {
  item: MaintenanceRequestUI;
  onPress?: (item: MaintenanceRequestUI) => void;
  onRating?: (item: MaintenanceRequestUI) => void;
}

const STATUS_CONFIG = {
  submitted: { label: "Chờ xử lý", color: "#f59e0b", bgColor: "#fef3c7" },
  acknowledged: { label: "Đã tiếp nhận", color: "#3b82f6", bgColor: "#dbeafe" },
  scheduled: { label: "Đã lên lịch", color: "#8b5cf6", bgColor: "#ede9fe" },
  in_progress: {
    label: "Đang xử lý",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  completed: { label: "Hoàn tất", color: "#10b981", bgColor: "#d1fae5" },
  cancelled: { label: "Hủy bỏ", color: "#ef4444", bgColor: "#fee2e2" },
};

const PRIORITY_CONFIG = {
  low: { label: "Thấp", color: "#6b7280", icon: "chevron-down" },
  medium: { label: "Trung bình", color: "#f59e0b", icon: "minus" },
  high: { label: "Cao", color: "#ef4444", icon: "chevron-up" },
  emergency: { label: "Khẩn cấp", color: "#dc2626", icon: "alert-circle" },
};

export default function MaintenanceRequestCard({
  item,
  onPress,
  onRating,
}: MaintenanceRequestCardProps) {
  const status = item.status as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  const priority = (item.priority || "medium") as keyof typeof PRIORITY_CONFIG;
  const priorityConfig = PRIORITY_CONFIG[priority];

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "N/A";

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.typeSection}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <MaterialCommunityIcons
                name="tools"
                size={20}
                color={statusConfig.color}
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.requestTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.requestCategory} numberOfLines={1}>
                Loại: {item.category || "Bảo trì chung"}
              </Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.color },
              ]}
            />
            <Text
              style={[styles.statusLabel, { color: statusConfig.color }]}
              numberOfLines={1}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Description */}
        {item.title && (
          <Text style={styles.description} numberOfLines={2}>
            {item.title}
          </Text>
        )}

        {/* Apartment and Room info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="home" size={16} color="#64748b" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.apartment}
            </Text>
          </View>
          {item.room && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="door" size={16} color="#64748b" />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.room}
              </Text>
            </View>
          )}
        </View>

        {/* Footer with priority, assigned staff and date */}
        <View style={styles.footer}>
          <View style={styles.priorityBadge}>
            <MaterialCommunityIcons
              size={14}
              color={priorityConfig.color}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.priorityText, { color: priorityConfig.color }]}
            >
              Độ ưu tiên: {priorityConfig.label}
            </Text>
          </View>

          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {item.assignedTo && (
          <View style={styles.assignedSection}>
            <MaterialCommunityIcons
              name="account-check"
              size={14}
              color="#3b82f6"
            />
            <Text style={styles.assignedText}>
              Người xử lý: {item.assignedTo}
            </Text>
          </View>
        )}

        {item.status === "completed" && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
                gap: 10,
              }}
            >
              <View></View>

              {!item.isRated && (
                <>
                  <Pressable
                    onPress={() => onRating?.(item)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: pressed ? "#059669" : "#10b981", // đổi màu khi nhấn
                        padding: 8,
                        borderRadius: 6,
                        marginTop: 12,
                        width: "30%",
                        alignItems: "center",
                        opacity: pressed ? 0.8 : 1, // hiệu ứng nhẹ
                      },
                    ]}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                      Đánh giá
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: "#f8fafc",
    borderColor: Colors.primary,
    shadowOpacity: 0.12,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  typeSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  typeInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 3,
  },
  requestCategory: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 80,
  },
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  assignedSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
  },
  assignedText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
    flex: 1,
  },
});
