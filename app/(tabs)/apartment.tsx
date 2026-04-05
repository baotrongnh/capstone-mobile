import DeviceGrid, { DeviceGridItem } from '@/components/apartment/DeviceGrid'
import DoorAccessCard from '@/components/apartment/DoorAccessCard'
import WeatherOverviewCard from '@/components/apartment/WeatherOverviewCard'
import { StyledContainer } from '@/components/styles'
import { useDeviceIot } from '@/hooks/query/useDevices'
import { IoTControlVariables } from '@/lib/services/iot.service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const devices: DeviceGridItem[] = [
     { id: 'device-1', deviceId: 1, title: 'Rèm cửa', subtitle: 'Ban công', icon: 'curtains-closed', topic: 'curtain' },
     { id: 'device-2', deviceId: 2, title: 'Đèn trần', subtitle: 'Phòng trẻ em', icon: 'lightbulb-outline', topic: 'light' },
     { id: 'device-3', deviceId: 1, title: 'Đèn phòng ngủ', subtitle: 'Phòng ngủ', icon: 'lightbulb-outline', topic: 'light' },
     { id: 'device-4', deviceId: 1, title: 'Báo động', subtitle: 'Toàn căn hộ', icon: 'alarm-light-outline', topic: 'alarm' },
]

//debug
const espId = 'ESP_A101'

export default function ApartmentControlScreen() {
     const router = useRouter()
     const { mutate } = useDeviceIot()

     const onDeviceToggle = (data: IoTControlVariables) => {
          mutate({
               espId: data.espId,
               deviceId: data.deviceId,
               topic: data.topic,
               action: data.action
          })
          console.log(data.deviceId, data.topic, data.action)
     }

     const onOpenDoor = () => {
          console.log('Door opened')
     }

     const onOpenWifiSetup = () => {
          router.navigate('/wifi-setup')
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
               >
                    <WeatherOverviewCard />

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Thiết lập thiết bị</Text>
                         <Pressable
                              onPress={onOpenWifiSetup}
                              style={({ pressed }) => [styles.wifiSetupCard, pressed && styles.wifiSetupCardPressed]}
                         >
                              <View style={styles.wifiSetupIconWrap}>
                                   <MaterialCommunityIcons name="wifi-cog" size={22} color="#2563eb" />
                              </View>

                              <View style={styles.wifiSetupContent}>
                                   <Text style={styles.wifiSetupTitle}>Wi-Fi</Text>
                                   <Text style={styles.wifiSetupSubtitle}>Cấu hình mạng cho HOME-IQ-HUB</Text>
                              </View>

                              <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
                         </Pressable>
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Thiết bị trong nhà</Text>
                         <DeviceGrid
                              devices={devices}
                              onDeviceToggle={onDeviceToggle}
                              espId={espId}
                         />
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Cửa ra vào</Text>
                         <DoorAccessCard title="Mở cửa chính" onOpenDoor={onOpenDoor} />
                    </View>
               </ScrollView>
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: '#f3f5f9',
          paddingHorizontal: 18,
     },
     content: {
          paddingBottom: 130,
          gap: 14,
     },
     sectionBlock: {
          gap: 10,
     },
     sectionTitle: {
          fontSize: 19,
          fontWeight: '700',
          color: '#0f172a',
     },
     wifiSetupCard: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
     },
     wifiSetupCardPressed: {
          opacity: 0.82,
     },
     wifiSetupIconWrap: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#eff6ff',
          alignItems: 'center',
          justifyContent: 'center',
     },
     wifiSetupContent: {
          flex: 1,
          gap: 2,
     },
     wifiSetupTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: '#0f172a',
     },
     wifiSetupSubtitle: {
          fontSize: 13,
          color: '#64748b',
     },
})