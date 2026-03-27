import DeviceGrid from '@/components/home/DeviceGrid';
import DoorAccessCard from '@/components/home/DoorAccessCard';
import { StyledContainer } from '@/components/styles';
import React from 'react';
import { Text } from 'react-native';

const devices = [
     { id: "1", deviceId: '1', title: "Đèn 1", deviceCount: 1, icon: "lightbulb" },
     { id: "2", deviceId: '2', title: "Đèn 2", deviceCount: 1, icon: "lightbulb" },
     { id: "3", deviceId: '1', title: "Rèm cửa", deviceCount: 1, icon: "curtains-closed" },
]

const onDeviceToggle = (deviceId: string, action: string) => {
     console.log(deviceId, action)
}

const onOpenDoor = () => {
     console.log('Door opened')
}

export default function HomeScreen() {
     return (
          <StyledContainer>
               <Text style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Các thiết bị trong nhà</Text>
               <DeviceGrid
                    devices={devices}
                    onDeviceToggle={onDeviceToggle}
               />
               <Text style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Cửa ra vào</Text>
               <DoorAccessCard onOpenDoor={onOpenDoor} />
          </StyledContainer>
     )
}