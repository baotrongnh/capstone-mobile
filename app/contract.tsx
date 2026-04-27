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
import { StyledContainer } from "@/components/styles";

import { useContracts } from "@/hooks/query/useContracts";
import { ContractWithMembers, ContractStatus } from "@/types/contract";
import { ContractCard } from "@/components/contract/ContractCard";
import { ViewContractModal } from "@/components/contract/ViewContractModal";
import { CancelContractModal } from "@/components/contract/CancelContractModal";
import { ExtendContractModal } from "@/components/contract/ExtendContractModal";
import { AddMemberModal } from "@/components/contract/AddMemberModal";
import { router, Stack } from "expo-router";

const VIETNAMESE_STATUS_LABELS: Partial<
  Record<"all" | ContractStatus, string>
> = {
  all: "Tất cả",
  draft: "Chờ ký",
  signed: "Đã ký",
  active: "Đang hoạt động",
  terminated: "Đã hủy",
};

const formatStatusLabel = (status: "all" | ContractStatus) => {
  return VIETNAMESE_STATUS_LABELS[status] || status;
};

export default function ContractPage() {
  const insets = useSafeAreaInsets();
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
      <StyledContainer style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.pageHeader}>
          <Pressable
            onPress={router.back}
            style={styles.backButton}
            hitSlop={10}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={18}
              color="#334155"
            />
          </Pressable>
          <Text style={styles.pageTitle}>Hợp đồng của tôi</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.refreshText}>Đang tải danh sách hợp đồng...</Text>
        </View>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.pageHeader}>
        <Pressable onPress={router.back} style={styles.backButton} hitSlop={10}>
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#334155" />
        </Pressable>
        <Text style={styles.pageTitle}>Hợp đồng của tôi</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Danh sách hợp đồng</Text>
        <Text style={styles.summarySubtitle}>
          Quản lý và theo dõi trạng thái hợp đồng
        </Text>
      </View>

      <View style={styles.tabsWrapper}>
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
                filter.value === "signed" && styles.filterButtonSigned,
                statusFilter === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text
                numberOfLines={1}
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

      <View style={styles.activeFilterRow}>
        <Text style={styles.activeFilterLabel}>Đang xem</Text>
        <Text style={styles.activeFilterStatus}>
          {formatStatusLabel(statusFilter)}
        </Text>
        <View style={styles.activeFilterCountPill}>
          <Text style={styles.activeFilterCountText}>
            {filteredContracts.length} hợp đồng
          </Text>
        </View>
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
            tintColor="#3b82f6"
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
    </StyledContainer>
  );
}

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
    backgroundColor: "#f3f5f9",
    paddingHorizontal: 18,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  summaryCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe5f3",
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "700",
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  tabsWrapper: {
    minHeight: 40,
    marginBottom: 10,
  },
  filterScrollView: {
    maxHeight: 40,
  },
  filterContent: {
    gap: 8,
    paddingRight: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  filterButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dbe5f3",
    backgroundColor: "#ffffff",
    minHeight: 32,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterButtonSigned: {
    minWidth: 64,
  },

  filterButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  filterButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },

  filterButtonTextActive: {
    color: "#1d4ed8",
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  activeFilterLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  activeFilterStatus: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  activeFilterCountPill: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeFilterCountText: {
    fontSize: 11,
    color: "#4338ca",
    fontWeight: "600",
  },
  contentContainer: {
    gap: 12,
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 8,
  },
  refreshText: {
    marginTop: 12,
    color: "#64748b",
    fontWeight: "600",
  },
});
