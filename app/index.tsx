import { useApartment } from "@/hooks/query/useApartments";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, Text, View } from "react-native";

export default function Index() {
  const router = useRouter()

  const { data, refetch, isLoading, error } = useApartment('f103a022-da39-42fb-b9da-25f386ee88db')
  if (isLoading) return <Text>Loading...</Text>;

  console.log(data?.data);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button title="TAB" onPress={() => router.navigate('/(tabs)/home')} />
      <Button title="FETCH" onPress={() => refetch()} />
      <Button title="LOGIN SCREEN" onPress={() => router.navigate('/login')} />
    </View>
  );
}
