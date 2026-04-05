import DeviceGrid from '@/components/home/DeviceGrid'
import DoorAccessCard from '@/components/home/DoorAccessCard'
import { StyledContainer } from '@/components/styles'
import { useDeviceIot } from '@/hooks/query/useDevices'
import { IotControlParams } from '@/lib/services/iot.service'
import React from 'react';
import { Text } from 'react-native';

const devices = [
     { id: "1", deviceId: '1', title: "Đèn 1", deviceCount: 1, icon: "lightbulb", topic: 'light' },
     { id: "2", deviceId: '2', title: "Đèn 2", deviceCount: 1, icon: "lightbulb", topic: 'light' },
     { id: "3", deviceId: '1', title: "Rèm cửa", deviceCount: 1, icon: "curtains-closed", topic: 'curtain' },
     { id: "4", deviceId: '1', title: "Báo động", deviceCount: 1, icon: "curtains-closed", topic: 'alarm' },
]

//debug
const espId = 'ESP_A101'

export default function MyApartmentScreen() {
     const { mutate, isPending, isSuccess } = useDeviceIot()

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
          <StyledContainer>
               <Text style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Các thiết bị trong nhà</Text>
               <DeviceGrid
                    devices={devices}
                    onDeviceToggle={onDeviceToggle}
                    espId={espId}
               />
               <Text style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Cửa ra vào</Text>
               <DoorAccessCard onOpenDoor={onOpenDoor} />
          </StyledContainer>
     )
}