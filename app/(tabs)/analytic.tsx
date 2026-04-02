import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { LineChart } from "react-native-chart-kit"
import { StyledContainer } from "@/components/styles"

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
  const data = activeTab === "electricity" ? DATA_ELECTRICITY : DATA_WATER

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
        <Text style={styles.title}>Tiêu thụ {data.name.toLowerCase()}</Text>
      </View>

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
      >
        {/* Charge Card - TODO: gắn data.charge từ API */}
        <View style={styles.chargeCard}>
          <View style={styles.chargeContent}>
            <Text style={styles.chargeLabel}>
              Tổng cộng bán đầu kỳ {data.lastPayment}
            </Text>
            <View style={styles.chargeAmount}>
              <Text style={styles.chargeValue}>
                {data.charge.toLocaleString("vi-VN")}
              </Text>
              <Text style={styles.chargeCurrency}>₫</Text>
            </View>
            <Text style={styles.chargeUnit}>
              Lần thanh toán cuối cùng kỳ {data.lastPayment}
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
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Tiêu thụ tháng này</Text>
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
    </StyledContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgLight,
  },
  header: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textBase,
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
  chargeIcon: {
    marginLeft: 12,
  },
  usageSection: {
    marginBottom: 18,
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
})