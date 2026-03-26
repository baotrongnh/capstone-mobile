import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="apartment" options={{ title: "About" }} />
      <Tabs.Screen name="profile" options={{ title: "" }} />
    </Tabs>
  );
}
