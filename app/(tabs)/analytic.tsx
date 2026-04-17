import ApartmentSelector from "@/components/apartment/apartment-selector"
import { StyledContainer } from "@/components/styles"
import { useIotMeters } from "@/hooks/query/useDevices"
import { useUtilityMonthlyInvoices } from "@/hooks/query/useInvoice"
import { useUserApartment } from "@/hooks/query/useUserApartment"
import { storage } from "@/stores/storage"
import type { MonthlyUtilityInvoiceItem } from "@/types/invoice"
import type { UserApartmentItem } from "@/types/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
     ActivityIndicator,
     Dimensions,
     Pressable,
     RefreshControl,
     ScrollView,
     StyleSheet,
     Text,
     View,
} from "react-native"
import { LineChart } from "react-native-chart-kit"

const APARTMENT_STORAGE_KEY = "selectedApartmentId"
const MONTH_LIMIT = 12

type UtilityKey = "electricity" | "water"

type MonthSlot = {
     key: string
     label: string
     year: number
}

type UtilityBreakdown = {
     consumption?: string | null
     amount?: string | null
     unit?: string | null
}

const UTILITY_LABEL: Record<UtilityKey, string> = {
     electricity: "Điện",
     water: "Nước",
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

const getApartmentId = (item: UserApartmentItem) => String(item.apartmentId)
const toNumber = (value?: string | number | null) => {
     const n = Number(value)
     return Number.isFinite(n) ? n : 0
}

const monthKey = (dateValue: string) => {
     const date = new Date(dateValue)
     if (Number.isNaN(date.getTime())) return ""
     const month = String(date.getMonth() + 1).padStart(2, "0")
     return `${date.getFullYear()}-${month}`
}

const buildMonthSlots = (limit: number) => {
     const now = new Date()
     const slots: MonthSlot[] = []

     for (let offset = limit - 1; offset >= 0; offset -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
          const month = String(date.getMonth() + 1).padStart(2, "0")
          slots.push({
               key: `${date.getFullYear()}-${month}`,
               label: String(date.getMonth() + 1),
               year: date.getFullYear(),
          })
     }

     return slots
}

const getUtilityBreakdown = (invoice: MonthlyUtilityInvoiceItem | undefined, utilityKey: UtilityKey): UtilityBreakdown | null => {
     if (!invoice) return null
     return utilityKey === "electricity" ? invoice.electricity ?? null : invoice.water ?? null
}

export default function AnalyticScreen() {
     const router = useRouter()
     const [activeTab, setActiveTab] = useState<UtilityKey>("electricity")
     const [selectedApartmentId, setSelectedApartmentId] = useState("")
     const [isHydratedStorage, setIsHydratedStorage] = useState(false)
     const [isRefreshing, setIsRefreshing] = useState(false)

     const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
     const { data: utilityInvoiceResponse, isLoading: isUtilityLoading, refetch: refetchUtilityInvoices } =
          useUtilityMonthlyInvoices({ limit: MONTH_LIMIT })
     const {
          data: meterResponse,
          isLoading: isMeterLoading,
          refetch: refetchMeters,
     } = useIotMeters({ apartmentId: selectedApartmentId || undefined })

     const myApartments = useMemo<UserApartmentItem[]>(() => {
          return (apartmentData?.data as UserApartmentItem[] | undefined) ?? []
     }, [apartmentData?.data])

     const syncSelectedApartmentFromStorage = useCallback(async () => {
          const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
          const nextSelectedApartmentId = savedApartmentId ?? ""

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

     const onSelectApartment = useCallback((apartmentId: string) => {
          setSelectedApartmentId(apartmentId)

          if (!apartmentId) {
               void storage.removeItem(APARTMENT_STORAGE_KEY)
               return
          }

          void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
     }, [])

     useEffect(() => {
          if (!isHydratedStorage || isApartmentLoading) return

          if (myApartments.length === 0) {
               if (!selectedApartmentId) return
               onSelectApartment("")
               return
          }

          const isValid = myApartments.some((item) => getApartmentId(item) === selectedApartmentId)
          if (isValid) return

          onSelectApartment(getApartmentId(myApartments[0]))
     }, [isApartmentLoading, isHydratedStorage, myApartments, onSelectApartment, selectedApartmentId])

     const monthSlots = useMemo(() => buildMonthSlots(MONTH_LIMIT), [])

     const apartmentInvoices = useMemo(() => {
          const items = utilityInvoiceResponse?.data?.items ?? []
          return items.filter((item) => String(item.apartment?.id || "") === selectedApartmentId)
     }, [selectedApartmentId, utilityInvoiceResponse?.data?.items])

     const invoiceByMonth = useMemo(() => {
          const map = new Map<string, MonthlyUtilityInvoiceItem>()

          apartmentInvoices.forEach((invoice) => {
               const key = monthKey(invoice.billingPeriodStart)
               if (key) map.set(key, invoice)
          })

          return map
     }, [apartmentInvoices])

     const currentSlot = monthSlots[monthSlots.length - 1]
     const activeMeter = activeTab === "electricity" ? meterResponse?.data?.electric : meterResponse?.data?.water
     const currentMeterConsumption = toNumber(activeMeter?.currentReading)

     const monthlyConsumptions = useMemo(() => {
          return monthSlots.map((slot) => {
               if (slot.key === currentSlot.key) {
                    return currentMeterConsumption
               }

               const invoice = invoiceByMonth.get(slot.key)
               const breakdown = getUtilityBreakdown(invoice, activeTab)
               return toNumber(breakdown?.consumption)
          })
     }, [activeTab, currentMeterConsumption, currentSlot.key, invoiceByMonth, monthSlots])

     const previousConsumption = monthlyConsumptions[monthlyConsumptions.length - 2] || 0

     const currentInvoice = invoiceByMonth.get(currentSlot.key)
     const currentBreakdown = getUtilityBreakdown(currentInvoice, activeTab)
     const hasCurrentInvoice = Boolean(currentInvoice)

     const currentConsumption = currentMeterConsumption
     const currentAmount = toNumber(currentBreakdown?.amount)
     const currentUnit =
          activeMeter?.unitOfMeasurement || currentBreakdown?.unit || (activeTab === "electricity" ? "kWh" : "m³")

     const trend = previousConsumption > 0 ? (currentConsumption - previousConsumption) / previousConsumption : 0
     const isTrendUp = trend >= 0

     const currentInvoiceStatus = String(currentInvoice?.status || "").toLowerCase()
     const isPaid = Boolean(currentInvoice?.paidAt)
     const canPayNow = Boolean(
          currentInvoice?.invoiceId && !isPaid && ["issued", "overdue"].includes(currentInvoiceStatus),
     )

     const currentBillingPeriodLabel = `${currentSlot.label}/${currentSlot.year}`

     const handleRefresh = useCallback(async () => {
          if (!selectedApartmentId) return

          setIsRefreshing(true)
          try {
               await Promise.all([refetchUtilityInvoices(), refetchMeters()])
          } finally {
               setIsRefreshing(false)
          }
     }, [refetchMeters, refetchUtilityInvoices, selectedApartmentId])

     if (!isHydratedStorage || isApartmentLoading) {
          return (
               <StyledContainer style={styles.container}>
                    <View style={styles.loadingWrap}>
                         <ActivityIndicator size="large" color={COLORS.primary} />
                         <Text style={styles.loadingText}>Đang tải căn hộ của bạn...</Text>
                    </View>
               </StyledContainer>
          )
     }

     const chartData = {
          labels: monthSlots.map((slot) => slot.label),
          datasets: [{ data: monthlyConsumptions, color: () => COLORS.primary }],
     }

     const chartConfig = {
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          color: () => COLORS.primary,
          strokeWidth: 3,
          decimalPlaces: 0,
          propsForLabels: {
               fontSize: 10,
               fill: COLORS.textMuted,
          },
          propsForBackgroundLines: {
               strokeDasharray: "0",
               stroke: "#e5e7eb",
               strokeWidth: 1,
          },
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                    refreshControl={
                         <RefreshControl
                              refreshing={isRefreshing}
                              onRefresh={() => {
                                   void handleRefresh()
                              }}
                              tintColor={COLORS.primary}
                         />
                    }
               >
                    <Text style={styles.title}>Chỉ số tiêu thụ</Text>

                    <ApartmentSelector
                         apartments={myApartments}
                         selectedApartmentId={selectedApartmentId}
                         onSelectApartment={onSelectApartment}
                         onViewApartments={() => router.push("/my-apartments")}
                    />

                    {!selectedApartmentId ? (
                         <View style={styles.emptyCard}>
                              <Text style={styles.emptyText}>Vui lòng chọn căn hộ để xem chỉ số điện nước.</Text>
                         </View>
                    ) : (
                         <>
                              <View style={styles.tabContainer}>
                                   {(["electricity", "water"] as UtilityKey[]).map((key) => (
                                        <Pressable
                                             key={key}
                                             style={[styles.tab, activeTab === key && styles.tabActive]}
                                             onPress={() => setActiveTab(key)}
                                        >
                                             <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>
                                                  {UTILITY_LABEL[key]}
                                             </Text>
                                        </Pressable>
                                   ))}
                              </View>

                              <View style={styles.chargeCard}>
                                   <View style={styles.chargeContent}>
                                        <Text style={styles.chargeLabel}>Hóa đơn tháng {currentBillingPeriodLabel}</Text>

                                        {hasCurrentInvoice ? (
                                             <View style={styles.chargeAmountRow}>
                                                  <Text style={styles.chargeValue}>{currentAmount.toLocaleString("vi-VN")}</Text>
                                                  <Text style={styles.chargeCurrency}>₫</Text>
                                             </View>
                                        ) : (
                                             <Text style={styles.noInvoiceText}>Chưa có hóa đơn tháng này</Text>
                                        )}

                                        {isPaid && currentInvoice?.paidAt ? (
                                             <Text style={styles.chargeSubText}>Đã thanh toán ngày {new Date(currentInvoice.paidAt).toLocaleDateString("vi-VN")}</Text>
                                        ) : (
                                             <Text style={styles.chargeSubText}>Trạng thái: {currentInvoice?.status || "chưa phát hành"}</Text>
                                        )}
                                   </View>

                                   <MaterialCommunityIcons
                                        name={activeTab === "electricity" ? "flash" : "water"}
                                        size={38}
                                        color={COLORS.white}
                                   />
                              </View>

                              <View style={styles.usageCard}>
                                   <View>
                                        <Text style={styles.usageLabel}>Sản lượng tháng này</Text>
                                        <Text style={styles.usageValue}>
                                             {currentConsumption}
                                             <Text style={styles.usageUnit}> {currentUnit}</Text>
                                        </Text>
                                   </View>

                                   <View style={[styles.trendChip, isTrendUp && styles.trendChipUp]}>
                                        <MaterialCommunityIcons
                                             name={isTrendUp ? "trending-up" : "trending-down"}
                                             size={16}
                                             color={isTrendUp ? COLORS.danger : COLORS.success}
                                        />
                                        <Text style={[styles.trendText, isTrendUp && styles.trendTextUp]}>
                                             {isTrendUp ? "+" : ""}{(trend * 100).toFixed(2)}%
                                        </Text>
                                   </View>
                              </View>

                              <View style={styles.chartCard}>
                                   <Text style={styles.chartTitle}>Sản lượng {MONTH_LIMIT} tháng gần nhất</Text>
                                   {isUtilityLoading || isMeterLoading ? <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 10 }} /> : null}

                                   <LineChart
                                        data={chartData}
                                        width={Dimensions.get("window").width - 56}
                                        height={235}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.chart}
                                        yAxisInterval={1}
                                        segments={4}
                                   />
                              </View>

                              {isPaid ? (
                                   <View style={styles.paidBadge}>
                                        <Text style={styles.paidBadgeText}>Đã thanh toán</Text>
                                   </View>
                              ) : null}

                              {canPayNow ? (
                                   <Pressable
                                        style={styles.paymentBtn}
                                        onPress={() =>
                                             router.push({
                                                  pathname: "/invoices/[id]",
                                                  params: { id: currentInvoice!.invoiceId },
                                             })
                                        }
                                   >
                                        <Text style={styles.paymentBtnText}>Thanh toán ngay</Text>
                                   </Pressable>
                              ) : null}
                         </>
                    )}
               </ScrollView>
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: COLORS.bgLight,
     },
     content: {
          paddingBottom: 120,
          gap: 12,
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
     },
     tab: {
          flex: 1,
          paddingVertical: 10,
          alignItems: "center",
     },
     tabActive: {
          borderBottomWidth: 3,
          borderBottomColor: COLORS.primary,
     },
     tabLabel: {
          fontSize: 14,
          color: COLORS.textMuted,
          fontWeight: "500",
     },
     tabLabelActive: {
          color: COLORS.primary,
          fontWeight: "700",
     },
     chargeCard: {
          borderRadius: 16,
          padding: 16,
          backgroundColor: COLORS.primary,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
     },
     chargeContent: {
          flex: 1,
     },
     chargeLabel: {
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
          marginBottom: 6,
     },
     chargeAmountRow: {
          flexDirection: "row",
          alignItems: "baseline",
     },
     chargeValue: {
          fontSize: 24,
          fontWeight: "700",
          color: COLORS.white,
     },
     chargeCurrency: {
          fontSize: 14,
          color: COLORS.white,
          marginLeft: 4,
     },
     chargeSubText: {
          marginTop: 6,
          fontSize: 11,
          color: "rgba(255,255,255,0.75)",
     },
     noInvoiceText: {
          fontSize: 16,
          fontWeight: "700",
          color: COLORS.white,
     },
     usageCard: {
          backgroundColor: COLORS.white,
          borderRadius: 14,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
     },
     usageLabel: {
          fontSize: 13,
          color: COLORS.textMuted,
          marginBottom: 6,
     },
     usageValue: {
          fontSize: 20,
          fontWeight: "700",
          color: COLORS.textBase,
     },
     usageUnit: {
          fontSize: 12,
          fontWeight: "500",
          color: COLORS.textMuted,
     },
     trendChip: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: "#f0fdf4",
     },
     trendChipUp: {
          backgroundColor: "#fef2f2",
     },
     trendText: {
          fontSize: 12,
          color: COLORS.success,
          fontWeight: "700",
     },
     trendTextUp: {
          color: COLORS.danger,
     },
     chartCard: {
          backgroundColor: COLORS.white,
          borderRadius: 14,
          padding: 14,
     },
     chartTitle: {
          fontSize: 14,
          fontWeight: "700",
          color: COLORS.textBase,
          marginBottom: 10,
     },
     chart: {
          borderRadius: 12,
          alignSelf: "center",
     },
     paidBadge: {
          borderRadius: 12,
          paddingVertical: 10,
          alignItems: "center",
          backgroundColor: "#ecfdf5",
          borderWidth: 1,
          borderColor: "#bbf7d0",
     },
     paidBadgeText: {
          fontSize: 14,
          color: "#166534",
          fontWeight: "700",
     },
     paymentBtn: {
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          backgroundColor: COLORS.primary,
     },
     paymentBtnText: {
          fontSize: 15,
          fontWeight: "700",
          color: COLORS.white,
     },
})
