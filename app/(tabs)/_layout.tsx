import { Tabs } from 'expo-router';

export default function TabLayout() {
     return (
          <Tabs>
               <Tabs.Screen name="home" options={{ title: 'Home' }} />
               <Tabs.Screen name="apartment" options={{ title: 'About' }} />
               <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          </Tabs>
     );
}
