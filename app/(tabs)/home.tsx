import SwitchAnimated from '@/app-example/components/home/DeviceCard'
import DeviceGrid from '@/app-example/components/home/DeviceGrid';
import React from 'react'
import { Text, View } from 'react-native'

const devices = [
     { id: "1", title: "Smart TV", deviceCount: 1, icon: "television" },
     { id: "2", title: "Air Conditioner", deviceCount: 1, icon: "air-conditioner" },
     { id: "3", title: "Air Purifier", deviceCount: 4, icon: "air-purifier" },
     { id: "4", title: "Smart Light", deviceCount: 4, icon: "lightbulb" },
];

export default function HomeScreen() {
     return (
          <View>
               <Text>Home</Text>
               <DeviceGrid
                    devices={devices}
                    onDeviceToggle={(deviceId, isOn) => console.log(`${deviceId}: ${isOn}`)}
               />
          </View>
     )
}