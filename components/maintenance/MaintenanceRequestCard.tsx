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
  streetAddress: string;
  fullAddress?: string;
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
  const addressLine = [item.apartment, item.streetAddress, item.fullAddress]
    .filter((part) => part && part !== "N/A")
    .join(" - ");

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.typeSection}>
            <View style={[styles.iconWrapper, { backgroundColor: "#eef2ff" }]}>
              <MaterialCommunityIcons
                name="tools"
                size={20}
                color={Colors.primary}
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.requestTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.categoryChip}>
                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={12}
                    color="#475569"
                  />
                  <Text style={styles.requestCategory} numberOfLines={1}>
                    {item.category || "Bảo trì chung"}
                  </Text>
                </View>
                <Text style={styles.requestId} numberOfLines={1}>
                  #{item.id.slice(-6)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusConfig.color}12`,
                borderColor: `${statusConfig.color}30`,
              },
            ]}
          >
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

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons name="home" size={14} color="#475569" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {addressLine || item.apartment}
            </Text>
          </View>
          {item.room && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="door" size={14} color="#475569" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {item.room}
              </Text>
            </View>
          )}
        </View>

        {/* Footer with priority, assigned staff and date */}
        <View style={styles.footer}>
          <View
            style={[
              styles.priorityBadge,
              { borderColor: `${priorityConfig.color}40` },
            ]}
          >
            <MaterialCommunityIcons
              name={
                priorityConfig.icon as React.ComponentProps<
                  typeof MaterialCommunityIcons
                >["name"]
              }
              size={14}
              color={priorityConfig.color}
              style={styles.priorityIcon}
            />
            <Text
              style={[styles.priorityText, { color: priorityConfig.color }]}
            >
              {priorityConfig.label}
            </Text>
          </View>

          <View style={styles.dateWrap}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={13}
              color="#94a3b8"
            />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
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
          <View style={styles.ratingSection}>
            {!item.isRated && (
              <Pressable
                onPress={() => onRating?.(item)}
                style={({ pressed }) => [
                  styles.ratingButton,
                  pressed && styles.ratingButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="star-four-points-outline"
                  size={14}
                  color="#ffffff"
                />
                <Text style={styles.ratingButtonText}>Đánh giá</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    borderColor: "#c7d2fe",
    backgroundColor: "#fcfcfd",
    transform: [{ scale: 0.992 }],
  },
  cardContent: {
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    maxWidth: "100%",
  },
  requestId: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  requestCategory: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    maxWidth: 80,
  },
  infoSection: {
    marginBottom: 11,
    gap: 6,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#eef2f7",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#1f2937",
    flex: 1,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  priorityIcon: {
    marginRight: 5,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  assignedSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  assignedText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  ratingSection: {
    marginTop: 13,
    alignItems: "flex-end",
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 110,
  },
  ratingButtonPressed: {
    backgroundColor: "#4338ca",
    opacity: 0.95,
  },
  ratingButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
