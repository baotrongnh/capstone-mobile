"use client";

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContracts } from "@/hooks/query/useContracts";
import { ContractWithMembers, ContractStatus } from "@/types/contract";
import { ContractCard } from "@/components/contract/ContractCard";
import { ViewContractModal } from "@/components/contract/ViewContractModal";
import { CancelContractModal } from "@/components/contract/CancelContractModal";
import { ExtendContractModal } from "@/components/contract/ExtendContractModal";
import { AddMemberModal } from "@/components/contract/AddMemberModal";
import { router, Stack } from "expo-router";

export default function ContractPage() {
  const insets = useSafeAreaInsets(); // Lấy giá trị tai thỏ/status bar
  const [statusFilter, setStatusFilter] = useState<"all" | ContractStatus>(
    "all",
  );
  const [selectedContract, setSelectedContract] =
    useState<ContractWithMembers | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const { data, isLoading, refetch, isPending: isRefreshing } = useContracts();

  const contractsList = useMemo<ContractWithMembers[]>(() => {
    return (data?.data ?? []) as ContractWithMembers[];
  }, [data]);

  const filteredContracts = useMemo(() => {
    if (statusFilter === "all") return contractsList;
    return contractsList.filter((c: ContractWithMembers) => {
      if (statusFilter === "signed")
        return c.status === "signed" || c.status === "active";
      return c.status === statusFilter;
    });
  }, [contractsList, statusFilter]);

  // Statistics
  const stats = {
    total: contractsList.length,
    active: contractsList.filter(
      (c) => c.status === "signed" || c.status === "active",
    ).length,
    pending: contractsList.filter((c) => c.status === "draft").length,
    expired: contractsList.filter((c) => c.status === "terminated").length,
  };

  const handleAction = (
    contractId: string,
    type: "view" | "cancel" | "extend" | "addMember",
  ) => {
    const contract = contractsList.find((c) => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      if (type === "view") setShowViewModal(true);
      if (type === "cancel") setShowCancelModal(true);
      if (type === "extend") setShowExtendModal(true);
      if (type === "addMember") setShowAddMemberModal(true);
    }
  };

  const handleDownloadContract = async (contractId: string) => {
    const contract = contractsList.find((c) => c.id === contractId);
    if (!contract?.pdfUrl) {
      Alert.alert("Lỗi", "Không tìm thấy file PDF để tải");
      return;
    }
    try {
      const pdfUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}${process.env.EXPO_PUBLIC_API_PREFIX}${contract.pdfUrl}`;
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch {
      Alert.alert("Lỗi", "Lỗi khi mở file PDF");
    }
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowCancelModal(false);
    setShowExtendModal(false);
    setShowAddMemberModal(false);
    setSelectedContract(null);
  };

  // UI Cho trạng thái Loading
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.refreshText}>Đang tải danh sách hợp đồng...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
        <View style={{ display: "flex", gap: 5 }}>
          <MaterialIcons
            onPress={router.back}
            name="arrow-back"
            size={24}
            color="black"
          />
          <Text style={styles.headerTitle}>Hợp đồng</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Quản lý và xem các hợp đồng của bạn
        </Text>

        <View style={styles.statsContainer}>
          <StatCard label="Tổng cộng" value={stats.total} />
          <StatCard
            label="Đang hoạt động"
            value={stats.active}
            color="#4caf50"
          />
          <StatCard label="Chờ xử lý" value={stats.pending} color="#ff9800" />
          <StatCard label="Đã hết hạn" value={stats.expired} color="#f44336" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContent}
        >
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter.value}
              style={[
                styles.filterButton,
                statusFilter === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === filter.value &&
                    styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Contract List */}
      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            onViewPress={() => handleAction(item.id, "view")}
            onCancelPress={() => handleAction(item.id, "cancel")}
            onExtendPress={() => handleAction(item.id, "extend")}
            onDownloadPress={() => handleDownloadContract(item.id)}
            onAddMemberPress={() => handleAction(item.id, "addMember")}
          />
        )}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyTitle}>Không tìm thấy hợp đồng</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thử chọn một bộ lọc khác
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#2196f3"
          />
        }
      />

      <ViewContractModal
        visible={showViewModal}
        contract={selectedContract}
        onClose={handleCloseModals}
        onDownload={() => {
          if (selectedContract?.id) handleDownloadContract(selectedContract.id);
        }}
      />
      <CancelContractModal
        visible={showCancelModal}
        contract={selectedContract}
        onClose={handleCloseModals}
      />
      <ExtendContractModal
        visible={showExtendModal}
        contract={selectedContract}
        onClose={handleCloseModals}
      />
      <AddMemberModal
        visible={showAddMemberModal}
        contract={selectedContract}
        onClose={handleCloseModals}
      />
    </View>
  );
}

// Sub-component cho Stat Card để code sạch hơn
const StatCard = ({ label, value, color = "#2196f3" }: any) => (
  <View style={styles.statCard}>
    <Text style={[styles.statNumber, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const STATUS_FILTERS: { label: string; value: "all" | ContractStatus }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ ký", value: "draft" },
  { label: "Đã ký", value: "signed" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Hủy", value: "terminated" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
    textAlign: "center",
  },
  filterScrollView: {
    marginTop: 4,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterButtonActive: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  refreshText: {
    marginTop: 12,
    color: "#888",
  },
});
