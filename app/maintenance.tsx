import { MaintenanceRequestCard } from "@/components/maintenance";
import ModalCreateMaintenance from "@/components/maintenance/CreateMaintenanceModal";
import ModalRatingMaintenance from "@/components/maintenance/RatingMaintenanceModal";
import { Colors } from "@/components/styles";
import { useGetMaintenanceRequests } from "@/hooks/query/useMaintenance";
import { MaintenanceRequest } from "@/lib/services/maintenance.service";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Extract item type from MaintenanceRequest response
type MaintenanceRequestItem = NonNullable<MaintenanceRequest["data"]>[number];

// UI-friendly type (with transformed fields)
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

// Helper function to transform API data to UI format
// Helper function to transform API data to UI format
const transformMaintenanceData = (
  apiData: MaintenanceRequestItem[] | undefined,
): MaintenanceRequestUI[] => {
  if (!apiData || !Array.isArray(apiData)) return [];

  // Transform data
  const transformed = apiData.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    priority: item.urgency,
    status: item.status === "submitted" ? "pending" : item.status,
    createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    completedAt: item.completedAt
      ? new Date(item.completedAt).toISOString().split("T")[0]
      : null,
    apartment: item.apartment?.apartmentNumber || "N/A",
    assignedTo: null,
    room: item.room?.roomNumber || null,
    isRated: item.isRated || false, // Assuming rating is null if not rated
  }));

  // KHÔNG dùng Map để lọc trùng nữa, vì 1 căn hộ có thể có nhiều yêu cầu
  // Trả về toàn bộ danh sách và sắp xếp theo ngày tạo (mới nhất lên đầu)
  return transformed.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export default function MaintenanceScreen() {
  const [requests, setRequests] = useState<MaintenanceRequestUI[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalRatingVisible, setIsModalRatingVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const { data: requestHistory, refetch } = useGetMaintenanceRequests();

  console.log("HAHA", requestHistory);

  useEffect(() => {
    if (
      requestHistory &&
      "data" in requestHistory &&
      Array.isArray(requestHistory.data)
    ) {
      const transformedData = transformMaintenanceData(requestHistory.data);
      setRequests(transformedData);
    }
  }, [requestHistory]);

  const handleCreateRequest = (
    newRequest: Omit<
      MaintenanceRequestUI,
      "id" | "createdAt" | "status" | "assignedTo"
    >,
  ) => {
    const request: MaintenanceRequestUI = {
      id: (requests.length + 1).toString(),
      ...newRequest,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
      assignedTo: null,
      isRated: false,
    };
    setRequests([request, ...requests]);
    setIsModalVisible(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Error refreshing requests:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRequestPress = (request: MaintenanceRequestUI) => {
    console.log("Request pressed:", request);
    // Navigate to detail screen or show detail modal
  };

  const handleRating = (request: MaintenanceRequestUI) => {
    // Show rating modal
    setSelectedRequestId(request.id);
    setIsModalRatingVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.headerContainer}>
        <Pressable>
          <MaterialIcons
            onPress={router.back}
            name="arrow-back"
            size={24}
            color="black"
          />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Bảo Trì & Sửa Chữa</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý yêu cầu bảo trì của bạn
          </Text>
        </View>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.createButtonPressed,
              ]}
              onPress={() => setIsModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
              <Text style={styles.createButtonText}>Tạo Yêu Cầu Bảo Trì</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <MaintenanceRequestCard
            item={item}
            onPress={handleRequestPress}
            onRating={handleRating}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="toolbox" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có yêu cầu bảo trì nào</Text>
            <Text style={styles.emptySubtext}>Nhấn Tạo Yêu Cầu để bắt đầu</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <ModalCreateMaintenance
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateRequest}
      />
      <ModalRatingMaintenance
        open={isModalRatingVisible}
        onClose={() => setIsModalRatingVisible(false)}
        id={selectedRequestId || ""}
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
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsContent: {
    gap: 12,
    paddingVertical: 8,
  },
  statCard: {
    width: 110,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonPressed: {
    backgroundColor: "#1d4ed8",
    opacity: 0.9,
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  listContainer: {
    paddingVertical: 12,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 8,
  },
});
