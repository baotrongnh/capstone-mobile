import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"

type WeatherPayload = {
     temperature: number
     weatherCode: number
     locationLabel: string
}

type WeatherOverviewCardProps = {
     variant?: "card" | "inline"
}

const weatherCodeText: Record<number, string> = {
     0: "Trời quang",
     1: "Ít mây",
     2: "Mây rải rác",
     3: "Nhiều mây",
     45: "Sương mù",
     48: "Sương mù dày",
     51: "Mưa phùn nhẹ",
     53: "Mưa phùn",
     55: "Mưa phùn nặng",
     61: "Mưa nhẹ",
     63: "Mưa vừa",
     65: "Mưa lớn",
     71: "Tuyết nhẹ",
     73: "Tuyết",
     75: "Tuyết dày",
     80: "Mưa rào nhẹ",
     81: "Mưa rào",
     82: "Mưa rào lớn",
     95: "Dông",
}

const weatherCodeIcon = (code: number): keyof typeof MaterialCommunityIcons.glyphMap => {
     if (code >= 95) return "weather-lightning-rainy"
     if (code >= 80) return "weather-pouring"
     if (code >= 61) return "weather-rainy"
     if (code >= 51) return "weather-partly-rainy"
     if (code === 45 || code === 48) return "weather-fog"
     if (code >= 1 && code <= 3) return "weather-partly-cloudy"
     return "weather-sunny"
}

const weatherCodeColor = (code: number) => {
     if (code >= 61) return "#2563eb"
     if (code >= 1 && code <= 3) return "#0ea5e9"
     return "#f59e0b"
}

const buildLocationLabel = (place?: Location.LocationGeocodedAddress) => {
     if (!place) return "Không xác định vị trí"
     const district = place.district || place.subregion || place.city || ""
     const region = place.region || place.country || ""

     if (district && region) return `${district}, ${region}`
     if (district) return district
     if (region) return region
     return "Không xác định vị trí"
}

export default function WeatherOverviewCard({ variant = "card" }: WeatherOverviewCardProps) {
     const [weather, setWeather] = useState<WeatherPayload | null>(null)
     const [loading, setLoading] = useState(true)
     const [errorText, setErrorText] = useState<string | null>(null)
     const isInline = variant === "inline"

     const fetchWeather = useCallback(async () => {
          setLoading(true)
          setErrorText(null)

          try {
               const permission = await Location.requestForegroundPermissionsAsync()
               if (!permission.granted) {
                    setErrorText("Bạn chưa cấp quyền vị trí cho ứng dụng")
                    setLoading(false)
                    return
               }

               const currentPosition = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
               })

               const { latitude, longitude } = currentPosition.coords
               const places = await Location.reverseGeocodeAsync({ latitude, longitude })
               const locationLabel = buildLocationLabel(places[0])

               const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
               )

               if (!response.ok) {
                    throw new Error("Không thể tải dữ liệu thời tiết")
               }

               const payload = await response.json()
               const current = payload?.current

               if (!current || typeof current.temperature_2m !== "number") {
                    throw new Error("Dữ liệu thời tiết không hợp lệ")
               }

               setWeather({
                    temperature: Math.round(current.temperature_2m),
                    weatherCode: Number(current.weather_code || 0),
                    locationLabel,
               })
          } catch (error) {
               console.log("Fetch weather error", error)
               setErrorText("Không thể cập nhật thời tiết")
          } finally {
               setLoading(false)
          }
     }, [])

     useEffect(() => {
          fetchWeather()
     }, [fetchWeather])

     if (loading) {
          if (isInline) {
               return (
                    <View style={[styles.inlineWrap, styles.center]}>
                         <ActivityIndicator size="small" color="#ffffff" />
                         <Text style={styles.inlineLoadingText}>Đang lấy thời tiết...</Text>
                    </View>
               )
          }

          return (
               <View style={[styles.card, styles.center]}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.loadingText}>Đang lấy thời tiết theo vị trí...</Text>
               </View>
          )
     }

     if (!weather || errorText) {
          if (isInline) {
               return (
                    <View style={[styles.inlineWrap, styles.center]}>
                         <Text style={styles.inlineErrorText}>{errorText ?? "Không có dữ liệu thời tiết"}</Text>
                         <Pressable onPress={fetchWeather} style={styles.inlineRetryLink}>
                              <Text style={styles.inlineRetryText}>Thử lại</Text>
                         </Pressable>
                    </View>
               )
          }

          return (
               <View style={[styles.card, styles.center]}>
                    <Text style={styles.errorText}>{errorText ?? "Không có dữ liệu thời tiết"}</Text>
                    <Pressable onPress={fetchWeather} style={styles.retryButton}>
                         <Text style={styles.retryText}>Thử lại</Text>
                    </Pressable>
               </View>
          )
     }

     const weatherText = weatherCodeText[weather.weatherCode] ?? "Thời tiết ổn định"
     const iconName = weatherCodeIcon(weather.weatherCode)
     const iconColor = weatherCodeColor(weather.weatherCode)

     if (isInline) {
          return (
               <View style={styles.inlineWrap}>
                    <View style={styles.inlineMain}>
                         <MaterialCommunityIcons name={iconName} size={18} color="#ffffff" />

                         <View style={styles.inlineBody}>
                              <Text style={styles.inlineTemperature}>{weather.temperature}°C</Text>
                              <Text numberOfLines={1} style={styles.inlineWeatherText}>
                                   {weatherText}
                              </Text>
                         </View>
                    </View>
               </View>
          )
     }

     return (
          <View style={styles.card}>
               <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
                    <MaterialCommunityIcons name={iconName} size={26} color={iconColor} />
               </View>

               <View style={styles.body}>
                    <Text style={styles.temperature}>{weather.temperature}°C</Text>
                    <Text numberOfLines={1} style={styles.weatherText}>
                         {weatherText}
                    </Text>
                    <Text numberOfLines={1} style={styles.locationText}>
                         {weather.locationLabel}
                    </Text>
               </View>

               <Pressable onPress={fetchWeather} style={styles.refreshButton}>
                    <MaterialCommunityIcons name="refresh" size={18} color="#2563eb" />
               </Pressable>
          </View>
     )
}

const styles = StyleSheet.create({
     card: {
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#dbe5f3",
          backgroundColor: "#ffffff",
          padding: 14,
          minHeight: 96,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
     },
     center: {
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
     },
     iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
     },
     body: {
          flex: 1,
          minHeight: 54,
          justifyContent: "center",
     },
     temperature: {
          fontSize: 24,
          fontWeight: "700",
          color: "#0f172a",
     },
     weatherText: {
          marginTop: 2,
          fontSize: 13,
          color: "#334155",
          fontWeight: "600",
     },
     locationText: {
          marginTop: 2,
          fontSize: 12,
          color: "#64748b",
     },
     refreshButton: {
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "#eff6ff",
          alignItems: "center",
          justifyContent: "center",
     },
     loadingText: {
          fontSize: 13,
          color: "#64748b",
     },
     inlineLoadingText: {
          color: "#ffffff",
          fontWeight: "600",
     },
     errorText: {
          fontSize: 13,
          color: "#b91c1c",
          fontWeight: "600",
     },
     inlineErrorText: {
          color: "#ffffff",
          fontSize: 12,
     },
     inlineRetryLink: {
          marginTop: 2,
          paddingHorizontal: 4,
          paddingVertical: 2,
     },
     retryButton: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: "#3b82f6",
     },
     retryText: {
          color: "#ffffff",
          fontSize: 12,
          fontWeight: "700",
     },
     inlineRetryText: {
          color: "#ffffff",
          fontSize: 12,
          fontWeight: "700",
          textDecorationLine: "underline",
     },
     inlineWrap: {
          minHeight: 36,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
     },
     inlineMain: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          flex: 1,
          minWidth: 0,
     },
     inlineBody: {
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
     },
     inlineTemperature: {
          fontSize: 17,
          fontWeight: "800",
          color: "#ffffff",
     },
     inlineWeatherText: {
          fontSize: 12,
          color: "rgba(255,255,255,0.92)",
          fontWeight: "500",
          flexShrink: 1,
     },
})
