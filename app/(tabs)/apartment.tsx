import DeviceGrid, { DeviceGridItem } from '@/components/home/DeviceGrid'
import DoorAccessCard from '@/components/home/DoorAccessCard'
import WeatherOverviewCard from '@/components/home/WeatherOverviewCard'
import { StyledContainer } from '@/components/styles'
import { useDeviceIot } from '@/hooks/query/useDevices'
import { IotControlParams } from '@/lib/services/iot.service'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

const devices: DeviceGridItem[] = [
     { id: 'device-1', deviceId: '1', title: 'Rèm cửa', subtitle: 'Ban công', icon: 'curtains-closed', topic: 'curtain' },
     { id: 'device-2', deviceId: '2', title: 'Đèn trần', subtitle: 'Phòng trẻ em', icon: 'lightbulb-outline', topic: 'light' },
     { id: 'device-3', deviceId: '3', title: 'Đèn phòng ngủ', subtitle: 'Phòng ngủ', icon: 'lightbulb-outline', topic: 'light' },
     { id: 'device-4', deviceId: '4', title: 'Báo động', subtitle: 'Toàn căn hộ', icon: 'alarm-light-outline', topic: 'alarm' },
]

//debug
const espId = 'ESP_A101'

export default function MyApartmentScreen() {
     const { mutate } = useDeviceIot()

     const onDeviceToggle = (data: IotControlParams) => {
          mutate({
               espId: data.espId,
               deviceId: data.deviceId,
               action: data.action,
               topic: data.topic
          })
          console.log(data.deviceId, data.topic, data.action)
     }

     const onOpenDoor = () => {
          console.log('Door opened')
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
               >
                    <WeatherOverviewCard />

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
})