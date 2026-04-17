import { useIotMeters } from '@/hooks/query/useDevices'
import { useUserApartment } from '@/hooks/query/useUserApartment'
import { storage } from '@/stores/storage'
import { UserApartmentItem } from '@/types/userApartment'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { LineChart } from "react-native-chart-kit"
import { StyledContainer } from "@/components/styles"

const APARTMENT_STORAGE_KEY = 'selectedApartmentId'

const getApartmentId = (item: UserApartmentItem) => String(item.apartmentId)
const getApartmentLabel = (item: UserApartmentItem) => item.apartment?.apartmentNumber || String(item.apartmentId)
const toNumber = (value?: string | null) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

const COLORS = {
  primary: "#3b82f6",
  textBase: "#0f172a",
  textMuted: "#6b7280",
  bgLight: "#f8fafc",
  white: "#ffffff",
  success: "#10b981",
  danger: "#ef4444",
}


const DATA_ELECTRICITY = {
  name: "Điện",
  icon: "flash",
  charge: 2250000,
  usage: 764,
  usageUnit: "kWh",
  changePercent: 0.45,
  isUp: true,
  monthlyData: [120, 150, 140, 180, 160, 190, 170, 210, 200, 220, 240, 250],
  lastPayment: "01/2025",
}

const DATA_WATER = {
  name: "Nước",
  icon: "water",
  charge: 2250000,
  usage: 12,
  usageUnit: "m³",
  changePercent: 0.23,
  isUp: true,
  monthlyData: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 19, 20],
  lastPayment: "01/2025",
}

export default function AnalyticScreen() {
  const [activeTab, setActiveTab] = useState<"electricity" | "water">("electricity")
  const [selectedApartmentId, setSelectedApartmentId] = useState('')
  const [isHydratedStorage, setIsHydratedStorage] = useState(false)
  const [isApartmentModalVisible, setIsApartmentModalVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
  const {
    data: meterData,
    isLoading: isMeterLoading,
    refetch: refetchMeters,
  } = useIotMeters(selectedApartmentId ? { apartmentId: selectedApartmentId } : undefined)

  const myApartments = useMemo<UserApartmentItem[]>(() => {
    return (apartmentData?.data as UserApartmentItem[] | undefined) ?? []
  }, [apartmentData?.data])

  const syncSelectedApartmentFromStorage = useCallback(async () => {
    const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
    const nextSelectedApartmentId = savedApartmentId ?? ''

    setSelectedApartmentId((prev) => (prev === nextSelectedApartmentId ? prev : nextSelectedApartmentId))
    setIsHydratedStorage(true)
  }, [])

  useEffect(() => {
    void syncSelectedApartmentFromStorage()
  }, [syncSelectedApartmentFromStorage])

  useFocusEffect(
    useCallback(() => {
      void syncSelectedApartmentFromStorage()
    }, [syncSelectedApartmentFromStorage]),
  )

  useEffect(() => {
    if (!isHydratedStorage || isApartmentLoading) {
      return
    }

    if (myApartments.length === 0) {
      if (!selectedApartmentId) {
        return
      }

      setSelectedApartmentId('')
      void storage.removeItem(APARTMENT_STORAGE_KEY)
      return
    }

    const isValidSelection = myApartments.some((item) => getApartmentId(item) === selectedApartmentId)
    const nextSelectedApartmentId = isValidSelection
      ? selectedApartmentId
      : getApartmentId(myApartments[0])

    if (nextSelectedApartmentId === selectedApartmentId) {
      return
    }

    setSelectedApartmentId(nextSelectedApartmentId)
    void storage.setItem(APARTMENT_STORAGE_KEY, nextSelectedApartmentId)
  }, [isApartmentLoading, isHydratedStorage, myApartments, selectedApartmentId])

  const selectedApartmentLabel = useMemo(() => {
    const selectedApartment = myApartments.find((item) => getApartmentId(item) === selectedApartmentId)

    return selectedApartment ? getApartmentLabel(selectedApartment) : ''
  }, [myApartments, selectedApartmentId])

  const onSelectApartment = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId)

    if (!apartmentId) {
      void storage.removeItem(APARTMENT_STORAGE_KEY)
      return
    }

    void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
    setIsApartmentModalVisible(false)
  }

  const data = useMemo(() => {
    const fallbackData = activeTab === "electricity" ? DATA_ELECTRICITY : DATA_WATER
    const meter = activeTab === "electricity" ? meterData?.data?.electric : meterData?.data?.water
    const usage = toNumber(meter?.currentReading)
    const previousUsage = toNumber(meter?.previousReading)
    const trend = previousUsage > 0 ? (usage - previousUsage) / previousUsage : 0

    return {
      ...fallbackData,
      usage,
      usageUnit: meter?.unitOfMeasurement || fallbackData.usageUnit,
      changePercent: Math.abs(trend),
      isUp: trend >= 0,
      charge: usage * toNumber(meter?.ratePerUnit),
      meterStatus: meter?.status,
      readingDate: meter?.readingDate,
    }
  }, [activeTab, meterData?.data?.electric, meterData?.data?.water])

  const handleRefresh = useCallback(async () => {
    if (!selectedApartmentId) {
      return
    }

    setIsRefreshing(true)
    try {
      await refetchMeters()
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchMeters, selectedApartmentId])

  if (!isHydratedStorage || isApartmentLoading) {
    return (
      <StyledContainer style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải căn hộ của bạn...</Text>
        </View>
      </StyledContainer>
    )
  }

  // Cấu hình biểu đồ
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: () => COLORS.primary,
    strokeWidth: 3,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fontFamily: "System",
      fill: COLORS.textMuted,
    },
    propsForBackgroundLines: {
      strokeDasharray: "0",
      stroke: "#e5e7eb",
      strokeWidth: 1,
    },
  }

  const chartData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        data: data.monthlyData,
        color: () => COLORS.primary,
      },
    ],
  }

  return (
    <StyledContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chỉ số tiêu thụ</Text>
      </View>

      {!selectedApartmentId ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Vui lòng chọn căn hộ để xem chỉ số điện nước.</Text>
        </View>
      ) : (
        <>
          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === "electricity" && styles.tabActive]}
              onPress={() => setActiveTab("electricity")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "electricity" && styles.tabLabelActive,
                ]}
              >
                {DATA_ELECTRICITY.name}
              </Text>
              {activeTab === "electricity" && <View style={styles.tabUnderline} />}
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "water" && styles.tabActive]}
              onPress={() => setActiveTab("water")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "water" && styles.tabLabelActive,
                ]}
              >
                {DATA_WATER.name}
              </Text>
              {activeTab === "water" && <View style={styles.tabUnderline} />}
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  void handleRefresh()
                }}
                tintColor="#2563eb"
              />
            }
          >
            {/* Charge Card - TODO: gắn data.charge từ API */}
            <View style={styles.chargeCard}>
              <View style={styles.chargeContent}>
                <Text style={styles.chargeLabel}>
                  Tạm tính theo công tơ {data.lastPayment}
                </Text>
                <View style={styles.chargeAmount}>
                  <Text style={styles.chargeValue}>
                    {data.charge.toLocaleString("vi-VN")}
                  </Text>
                  <Text style={styles.chargeCurrency}>₫</Text>
                </View>

                <Pressable
                  onPress={() => setIsApartmentModalVisible(true)}
                  style={styles.apartmentMiniTrigger}
                  disabled={myApartments.length === 0}
                >
                  <MaterialCommunityIcons name="home-city-outline" size={13} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.apartmentMiniText} numberOfLines={1}>
                    {selectedApartmentLabel || 'Chọn căn hộ'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={14} color="rgba(255, 255, 255, 0.9)" />
                </Pressable>

                <Text style={styles.chargeUnit}>
                  {data.readingDate ? `Cập nhật ${new Date(data.readingDate).toLocaleDateString("vi-VN")}` : `Lần thanh toán cuối cùng kỳ ${data.lastPayment}`}
                </Text>
              </View>
              <View style={styles.chargeIcon}>
                <MaterialCommunityIcons
                  name={data.icon as any}
                  size={40}
                  color={COLORS.white}
                />
              </View>
            </View>

            {/* Usage Summary - TODO: gắn usage, changePercent, isUp từ API */}
            <View style={styles.usageSection}>
              <View style={styles.usageCard}>
                <View>
                  <Text style={styles.usageLabel}>Tổng tiêu thụ tháng này</Text>
                  <View style={styles.usageValue}>
                    <Text style={styles.usageNumber}>
                      {data.usage}
                      <Text style={styles.usageUnit}>{data.usageUnit}</Text>
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.usageChange,
                    data.isUp && styles.usageChangeUp,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={data.isUp ? "trending-up" : "trending-down"}
                    size={16}
                    color={data.isUp ? COLORS.danger : COLORS.success}
                  />
                  <Text
                    style={[
                      styles.usageChangeText,
                      data.isUp && styles.usageChangeUpText,
                    ]}
                  >
                    {data.isUp ? "+" : ""}{(data.changePercent * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
              {isMeterLoading ? (
                <View style={styles.meterLoadingWrap}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.meterLoadingText}>Đang tải dữ liệu công tơ...</Text>
                </View>
              ) : null}
              <Text style={styles.meterNoteText}>
                {data.meterStatus ? `Trạng thái công tơ: ${data.meterStatus}` : "Dữ liệu công tơ đang ở chế độ tạm"}
              </Text>
            </View>

            {/* Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Tiêu thụ tháng này (dữ liệu tạm)</Text>
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 56}
                height={240}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                yAxisInterval={1}
                segments={4}
              />
            </View>

            {/* Payment Button */}
            <Pressable style={styles.paymentBtn}>
              <Text style={styles.paymentBtnText}>Thanh toán ngay</Text>
            </Pressable>

            <View style={{ height: 120 }} />
          </ScrollView>
        </>
      )}

      <Modal
        visible={isApartmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsApartmentModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsApartmentModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => { }}>
            <Text style={styles.modalTitle}>Chọn căn hộ</Text>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {myApartments.map((item) => {
                const apartmentId = getApartmentId(item)
                const isActive = apartmentId === selectedApartmentId

                return (
                  <Pressable
                    key={apartmentId}
                    onPress={() => onSelectApartment(apartmentId)}
                    style={[styles.modalItem, isActive && styles.modalItemActive]}
                  >
                    <Text numberOfLines={1} style={[styles.modalItemText, isActive && styles.modalItemTextActive]}>
                      {getApartmentLabel(item)}
                    </Text>

                    {isActive ? (
                      <MaterialCommunityIcons name="check-circle" size={18} color="#1d4ed8" />
                    ) : null}
                  </Pressable>
                )
              })}
            </ScrollView>

            <Pressable onPress={() => setIsApartmentModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </StyledContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgLight,
  },
  header: {
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textBase,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tabActive: {},
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chargeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  chargeContent: {
    flex: 1,
  },
  chargeLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  chargeAmount: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  chargeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
  },
  chargeCurrency: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 4,
  },
  chargeUnit: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
  },
  apartmentMiniTrigger: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  apartmentMiniText: {
    maxWidth: 190,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
  },
  chargeIcon: {
    marginLeft: 12,
  },
  usageSection: {
    marginBottom: 18,
  },
  meterLoadingWrap: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meterLoadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  meterNoteText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  usageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  usageLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  usageValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  usageNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textBase,
  },
  usageUnit: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  usageChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  usageChangeUp: {
    backgroundColor: "#fef2f2",
  },
  usageChangeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  usageChangeUpText: {
    color: COLORS.danger,
  },
  chartSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textBase,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    alignSelf: "center",
  },
  paymentBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  paymentBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    justifyContent: "flex-end",
    padding: 12,
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    maxHeight: "62%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textBase,
    marginBottom: 10,
  },
  modalList: {
    maxHeight: 320,
  },
  modalListContent: {
    gap: 8,
    paddingBottom: 10,
  },
  modalItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalItemActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },
  modalItemText: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  modalItemTextActive: {
    color: "#1d4ed8",
  },
  modalCloseButton: {
    marginTop: 2,
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
})