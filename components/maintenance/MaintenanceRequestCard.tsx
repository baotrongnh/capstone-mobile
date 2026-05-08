import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MaintenanceRequestUI {
  id: string;
  title: string;
  category?: string;
  priority?: string;
  urgency?: string;
  status: string;
  createdAt?: string;
  completedAt?: string | null;
  updatedAt?: string | null;
  apartment:
    | string
    | {
        apartmentNumber?: string;
        wardCode?: number;
        streetAddress?: string;
        wardName?: string;
        provinceName?: string | null;
        fullAddress?: string;
        address?: string;
      };
  assignedTo?: string | null;
  assignedTask?: {
    id?: string;
    assignedToStaffId?: string;
    status?: string;
  } | null;
  room?: string | null;
  streetAddress?: string;
  fullAddress?: string;
  images?: string[];
  completionImages?: string[];
  isRated?: boolean;

  requesterName?: string;
}

interface MaintenanceRequestCardProps {
  item: MaintenanceRequestUI;
  onPress?: (...args: any[]) => void;
  onRating?: (...args: any[]) => void;
}

const STATUS_CONFIG = {
  submitted: {
    label: "CHỜ XỬ LÝ",
    color: "#D97706",
    bgColor: "#FEF3C7",
  },
  acknowledged: {
    label: "ĐÃ TIẾP NHẬN",
    color: "#2563EB",
    bgColor: "#DBEAFE",
  },
  scheduled: {
    label: "ĐÃ LÊN LỊCH",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
  },
  in_progress: {
    label: "ĐANG XỬ LÝ",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
  },
  completed: {
    label: "HOÀN TẤT",
    color: "#059669",
    bgColor: "#D1FAE5",
  },
  cancelled: {
    label: "ĐÃ HỦY",
    color: "#DC2626",
    bgColor: "#FEE2E2",
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Thấp",
    color: "#6B7280",
    icon: "chevron-down",
  },
  medium: {
    label: "Trung bình",
    color: "#D97706",
    icon: "minus",
  },
  high: {
    label: "Cao",
    color: "#DC2626",
    icon: "chevron-up",
  },
  emergency: {
    label: "Khẩn cấp",
    color: "#B91C1C",
    icon: "alert-circle",
  },
};

export default function MaintenanceRequestCard({
  item,
  onPress,
  onRating,
}: MaintenanceRequestCardProps) {
  const status = (item.status || "submitted") as keyof typeof STATUS_CONFIG;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;

  const priorityKey = (item.priority ||
    item.urgency ||
    "medium") as keyof typeof PRIORITY_CONFIG;

  const priorityConfig = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG.medium;

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--/--/----";

  const updatedDate = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : formattedDate;

  const aptObj =
    typeof item.apartment === "object"
      ? item.apartment
      : {
          address: (item.apartment as string) || item.streetAddress,
        };

  const apartmentNumber = aptObj.apartmentNumber || item.room || "Không có";

  const addressParts = [
    aptObj.streetAddress,
    aptObj.wardName,
    aptObj.provinceName,
    aptObj.fullAddress,
    aptObj.address,
  ]
    .filter(Boolean)
    .map(String);

  const addressLine = addressParts.join(", ");

  const assignedLabel =
    item.assignedTo || item.assignedTask?.assignedToStaffId || "Chưa phân công";

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.bgColor,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.leftRow}>
            <MaterialCommunityIcons
              name="signal"
              size={16}
              color={priorityConfig.color}
            />

            <Text style={styles.label}>Mức độ</Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: `${priorityConfig.color}12`,
              },
            ]}
          >
            <MaterialCommunityIcons size={13} color={priorityConfig.color} />

            <Text
              style={[
                styles.priorityText,
                {
                  color: priorityConfig.color,
                },
              ]}
            >
              {priorityConfig.label}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.leftRow}>
            <MaterialCommunityIcons
              name="shape-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.label}>Danh mục</Text>
          </View>

          <Text style={styles.value}>{item.category || "Bảo trì"}</Text>
        </View>

        <View style={styles.infoRowTop}>
          <View style={styles.leftRowTop}>
            <MaterialCommunityIcons
              name="home-city-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.label}>Căn hộ</Text>
          </View>

          <View style={styles.rightContent}>
            <Text style={styles.subValue} numberOfLines={2}>
              {addressLine || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.leftRow}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.label}>Ngày tạo</Text>
          </View>

          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.leftRow}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={16}
              color="#6B7280"
            />

            <Text style={styles.label}>Cập nhật</Text>
          </View>

          <Text style={styles.value}>{updatedDate}</Text>
        </View>
      </View>

      {item.status === "completed" && !item.isRated ? (
        <>
          <View style={styles.divider} />

          <View style={styles.footer}>
            <Pressable
              onPress={() => onRating?.(item)}
              style={({ pressed }) => [
                styles.ratingButton,
                pressed && {
                  opacity: 0.9,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="star-outline"
                size={16}
                color="#fff"
              />

              <Text style={styles.ratingButtonText}>Đánh giá dịch vụ</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.992 }],
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },

  requestId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 4,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 22,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  section: {
    padding: 16,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  leftRowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  rightContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  value: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  subValue: {
    textAlign: "right",
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#111827",
  },

  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },

  footer: {
    padding: 16,
  },

  ratingButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  ratingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
