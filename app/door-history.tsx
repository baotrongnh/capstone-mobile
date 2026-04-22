import ApartmentSelector from "@/components/apartment/apartment-selector"
import { Colors } from "@/components/styles"
import { useDoorHistory } from "@/hooks/query/useDevices"
import { useUserApartment } from "@/hooks/query/useUserApartment"
import type { IotDoorHistoryItem } from "@/lib/services/iot.service"
import { storage } from "@/stores/storage"
import type { UserApartmentItem } from "@/types/userApartment"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const APARTMENT_STORAGE_KEY = "selectedApartmentId"

const getActionLabel = (action?: string) => {
  switch ((action ?? "").toLowerCase()) {
    case "unlock":
    case "open":
      return "Mở cửa"
    case "lock":
      return "Khóa cửa"
    default:
      return action || "Hoạt động cửa"
  }
}

const getStatusColor = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "success":
    case "completed":
      return "#16a34a"
    case "failed":
    case "error":
      return "#dc2626"
    default:
      return Colors.primary
  }
}

const formatDateTime = (value?: string) => {
  if (!value) return "--"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function DoorHistoryScreen() {
  const [selectedApartmentId, setSelectedApartmentId] = useState("")
  const [isHydratedStorage, setIsHydratedStorage] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
  const apartments = apartmentData?.data as UserApartmentItem[] | undefined

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch,
  } = useDoorHistory({
    apartmentId: selectedApartmentId || undefined,
    limit: 20,
  })

  const historyItems = historyData?.data?.items ?? []
  const total = historyData?.data?.total ?? historyItems.length

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
      if (cancelled) return

      setSelectedApartmentId(savedApartmentId ?? "")
      setIsHydratedStorage(true)
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHydratedStorage || isApartmentLoading) return

    const nextApartments = apartments ?? []
    if (!nextApartments.length) {
      if (!selectedApartmentId) return

      setSelectedApartmentId("")
      void storage.removeItem(APARTMENT_STORAGE_KEY)
      return
    }

    const hasSelection = nextApartments.some((item) => String(item.apartmentId) === selectedApartmentId)
    if (hasSelection) return

    const nextApartmentId = String(nextApartments[0].apartmentId)
    setSelectedApartmentId(nextApartmentId)
    void storage.setItem(APARTMENT_STORAGE_KEY, nextApartmentId)
  }, [apartments, isApartmentLoading, isHydratedStorage, selectedApartmentId])

  const onSelectApartment = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId)

    if (apartmentId) {
      void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
      return
    }

    void storage.removeItem(APARTMENT_STORAGE_KEY)
  }

  const onRefresh = async () => {
    if (!selectedApartmentId) return

    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const renderItem = ({ item }: { item: IotDoorHistoryItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="door-open" size={20} color={Colors.primary} />
        </View>

        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{getActionLabel(item.action)}</Text>
          <Text style={styles.cardTime}>{formatDateTime(item.createdAt)}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      {!!item.description && <Text style={styles.description}>{item.description}</Text>}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Bo mạch:</Text>
        <Text style={styles.metaValue}>{item.boardId}</Text>
      </View>

      {item.deviceId != null && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Thiết bị:</Text>
          <Text style={styles.metaValue}>#{item.deviceId}</Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Người thao tác:</Text>
        <Text style={styles.metaValue}>
          {item.actorType} · {item.actorId}
        </Text>
      </View>
    </View>
  )

  if (!isHydratedStorage || isApartmentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu căn hộ...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void onRefresh()
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Pressable onPress={router.back} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={22} color="#334155" />
                </Pressable>

                <View style={styles.headerTextWrap}>
                  <Text style={styles.headerTitle}>Lịch sử mở cửa</Text>
                  <Text style={styles.headerSubtitle}>Theo dõi các lần mở cửa gần đây của căn hộ</Text>
                </View>
              </View>
            </View>

            <ApartmentSelector
              apartments={apartments ?? []}
              selectedApartmentId={selectedApartmentId}
              onSelectApartment={onSelectApartment}
              onViewApartments={() => router.push("/my-apartments")}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tổng lịch sử</Text>
              <Text style={styles.summaryValue}>{total}</Text>
              <Text style={styles.summaryText}>Hiển thị {historyItems.length} bản ghi mới nhất</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          selectedApartmentId ? (
            isHistoryLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingInlineText}>Đang tải lịch sử mở cửa...</Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="history" size={40} color="#94a3b8" />
                <Text style={styles.emptyTitle}>Chưa có lịch sử mở cửa</Text>
                <Text style={styles.emptyText}>Các lần mở cửa gần đây sẽ hiển thị tại đây.</Text>
              </View>
            )
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="home-search-outline" size={40} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Chọn căn hộ để xem lịch sử</Text>
              <Text style={styles.emptyText}>Bạn cần chọn một căn hộ trước khi tải dữ liệu.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  summaryText: {
    fontSize: 12,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardTime: {
    fontSize: 12,
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  metaValue: {
    flex: 1,
    fontSize: 12,
    color: "#334155",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  loadingInline: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingInlineText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
})
