import ModalRatingMaintenance from "@/components/maintenance/RatingMaintenanceModal";
import { Colors } from "@/components/styles";
import { useGetMaintenanceById } from "@/hooks/query/useMaintenance";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  submitted: { label: "Chờ xử lý", color: "#f59e0b", bgColor: "#fef3c7" },
  acknowledged: { label: "Đã tiếp nhận", color: "#3b82f6", bgColor: "#dbeafe" },
  scheduled: { label: "Đã lên lịch", color: "#8b5cf6", bgColor: "#ede9fe" },
  in_progress: { label: "Đang xử lý", color: "#8b5cf6", bgColor: "#ede9fe" },
  completed: { label: "Hoàn tất", color: "#10b981", bgColor: "#d1fae5" },
  cancelled: { label: "Hủy bỏ", color: "#ef4444", bgColor: "#fee2e2" },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  low: { label: "Thấp", color: "#6b7280", icon: "chevron-down" },
  medium: { label: "Trung bình", color: "#f59e0b", icon: "minus" },
  high: { label: "Cao", color: "#ef4444", icon: "chevron-up" },
  emergency: { label: "Khẩn cấp", color: "#dc2626", icon: "alert-circle" },
};

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Nước",
  hvac: "Điều hòa",
  electrical: "Điện",
  appliance: "Thiết bị",
  pest_control: "Phòng trừ sâu",
  structural: "Cấu trúc",
  other: "Khác",
};

const formatDateTime = (dateValue?: string | null) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MaintenanceDetailScreen() {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const requestId = typeof id === "string" ? id : "";

  const {
    data: maintenanceResponse,
    isLoading,
    refetch,
    isRefetching,
  } = useGetMaintenanceById(requestId);

  const request = maintenanceResponse?.data;
  const statusConfig = STATUS_CONFIG[request?.status || "submitted"];
  const priorityConfig = PRIORITY_CONFIG[request?.urgency || "medium"];
  const categoryLabel = CATEGORY_LABELS[request?.category || ""] || "Khác";

  const fullAddress = [
    request?.apartment?.apartmentNumber
      ? `Phòng ${request.apartment.apartmentNumber}`
      : null,
    request?.apartment?.streetAddress || request?.apartment?.address || null,
    request?.apartment?.wardName || null,
    request?.apartment?.provinceName || null,
  ]
    .filter(Boolean)
    .join(" - ");

  const issueImages = request?.images || [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <Pressable style={styles.backButton} onPress={router.back}>
            <MaterialIcons
              name="arrow-back-ios-new"
              size={18}
              color="#334155"
            />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết bảo trì</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Theo dõi trạng thái và thông tin xử lý
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centerText}>Đang tải chi tiết yêu cầu...</Text>
        </View>
      ) : !request ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons
            name="file-search-outline"
            size={56}
            color="#cbd5e1"
          />
          <Text style={styles.centerText}>Không tìm thấy yêu cầu bảo trì</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Tải lại</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.requestCode}>#{request.id.slice(-8)}</Text>
                <Text style={styles.requestTitle}>{request.title}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusConfig?.bgColor || "#fef3c7",
                    borderColor: `${statusConfig?.color || "#f59e0b"}44`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusConfig?.color || "#f59e0b" },
                  ]}
                >
                  {statusConfig?.label || "Chờ xử lý"}
                </Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Mức ưu tiên</Text>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: `${priorityConfig.color}12`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  size={13}
                  color={priorityConfig.color}
                />

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

            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Loại yêu cầu</Text>
                <Text style={styles.fieldValue}>{categoryLabel}</Text>
              </View>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Mã căn hộ</Text>
                <Text style={styles.fieldValue}>
                  {request.apartment?.apartmentNumber || "-"}
                </Text>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Ngày tạo</Text>
                <Text style={styles.fieldValue}>
                  {formatDateTime(request.createdAt)}
                </Text>
              </View>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Cập nhật</Text>
                <Text style={styles.fieldValue}>
                  {formatDateTime(request.updatedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Người gửi yêu cầu</Text>
                <Text style={styles.fieldValue}>
                  {request.user?.fullName || "-"}
                </Text>
                <Text style={styles.subValueText}>
                  {request.user?.phone || "-"}
                </Text>
              </View>

              <View style={styles.twoColumnItem}>
                <Text style={styles.fieldLabel}>Nhân viên được phân công</Text>
                <Text style={styles.fieldValue}>
                  {request.assignedTask?.assignedToStaff?.fullName ||
                    "Chưa phân công"}
                </Text>
                <Text style={styles.subValueText}>
                  {request.assignedTask?.assignedToStaff?.employeeCode || "-"}
                </Text>
              </View>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={styles.fieldLabel}>Địa chỉ</Text>
              <Text style={styles.fieldValue}>{fullAddress || "-"}</Text>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={styles.fieldLabel}>Mô tả vấn đề</Text>
              <Text style={styles.descriptionText}>
                {request.description || "-"}
              </Text>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={styles.fieldLabel}>Ghi chú hoàn tất</Text>
              <Text style={styles.descriptionText}>
                {request.completionNotes || "-"}
              </Text>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={styles.fieldLabel}>Đánh giá từ người thuê</Text>
              <Text style={styles.fieldValue}>
                {request.tenantRating
                  ? `${request.tenantRating}/5`
                  : "Chưa đánh giá"}
              </Text>
              <Text style={styles.subValueText}>
                {request.tenantFeedback || "Chưa có phản hồi"}
              </Text>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={styles.fieldLabel}>Ảnh sự cố</Text>
              {issueImages.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageRow}
                >
                  {issueImages.map((uri: string, index: number) => (
                    <Image
                      key={`${uri}-${index}`}
                      source={{ uri }}
                      style={styles.issueImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.subValueText}>Không có ảnh</Text>
              )}
            </View>

            {request.status === "completed" && (
              <View
                style={[
                  styles.noticeBox,
                  request.isRated ? styles.noticeSuccess : styles.noticeInfo,
                ]}
              >
                <MaterialCommunityIcons
                  name={request.isRated ? "check-circle" : "information"}
                  size={18}
                  color={request.isRated ? "#16a34a" : "#2563eb"}
                />
                <Text
                  style={[
                    styles.noticeText,
                    { color: request.isRated ? "#166534" : "#1e3a8a" },
                  ]}
                >
                  {request.isRated
                    ? "Bạn đã đánh giá yêu cầu này. Cảm ơn phản hồi của bạn."
                    : "Yêu cầu đã hoàn tất. Bạn có thể gửi đánh giá cho dịch vụ."}
                </Text>
              </View>
            )}
          </View>

          {request.status === "completed" && !request.isRated && (
            <Pressable
              style={styles.rateButton}
              onPress={() => setIsRatingOpen(true)}
            >
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.rateButtonText}>Đánh giá dịch vụ</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      <ModalRatingMaintenance
        open={isRatingOpen}
        onClose={() => {
          setIsRatingOpen(false);
          refetch();
        }}
        id={request?.id || ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 8,
    marginLeft: 48,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  centerText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  requestCode: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 26,
  },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  priorityRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  twoColumnItem: {
    flex: 1,
  },
  fullWidthRow: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  subValueText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    fontWeight: "500",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  imageRow: {
    paddingTop: 6,
    gap: 10,
  },
  issueImage: {
    width: 132,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f1f5f9",
  },
  noticeBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  noticeInfo: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  noticeSuccess: {
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  rateButton: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
