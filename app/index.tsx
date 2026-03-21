import { Link, useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  const router = useRouter()

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
      <Button title="LOGIN SCREEN" onPress={() => router.navigate('/login')} />
    </View>
  );
}
