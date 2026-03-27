import DeviceGrid from '@/components/home/DeviceGrid';
import { StyledContainer } from '@/components/styles';
import React from 'react';
import { Text } from 'react-native';

const devices = [
     { id: "1", deviceId: '1', title: "Light 1", deviceCount: 1, icon: "lightbulb" },
     { id: "2", deviceId: '1', title: "Light 2", deviceCount: 1, icon: "lightbulb" },
]

const onDeviceToggle = (deviceId: string, action: string) => {
     console.log(deviceId, action)
}

export default function HomeScreen() {
     return (
          <StyledContainer>
               <Text>Home</Text>
               <DeviceGrid
                    devices={devices}
                    onDeviceToggle={onDeviceToggle}
               />
          </StyledContainer>
     )
}