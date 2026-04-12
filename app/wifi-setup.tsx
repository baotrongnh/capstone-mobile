import { Colors } from "@/components/styles"
import { GuideModal } from "@/components/wifi-setup/guide-modal"
import { NetworkStatusCard } from "@/components/wifi-setup/network-status-card"
import { WifiFormCard } from "@/components/wifi-setup/wifi-form-card"
import { useWifiSetupController } from "@/hooks/wifi/useWifiSetupController"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import {
     Keyboard,
     KeyboardAvoidingView,
     Platform,
     Pressable,
     ScrollView,
     StyleSheet,
     Text,
     TouchableOpacity,
     TouchableWithoutFeedback,
     View,
} from "react-native"

export default function WifiSetupScreen() {
     const router = useRouter()
     const {
          requiredDeviceWifi,
          ssid,
          setSsid,
          password,
          setPassword,
          showPassword,
          togglePassword,
          message,
          statusDisplay,
          isBusy,
          canSubmit,
          isCheckingNetwork,
          isOnDeviceNetwork,
          isGuideOpen,
          openGuide,
          closeGuide,
          handleCheckNetwork,
          handleSendWifi,
     } = useWifiSetupController()

     return (
          <KeyboardAvoidingView
               style={styles.wrapper}
               behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
               <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                         contentContainerStyle={styles.scrollContent}
                         keyboardShouldPersistTaps="handled"
                         showsVerticalScrollIndicator={false}
                    >
                         <View style={styles.header}>
                              <View style={styles.headerTop}>
                                   <Pressable onPress={() => router.back()} style={styles.backButton}>
                                        <Ionicons name="chevron-back" size={24} color="#334155" />
                                   </Pressable>
                                   <Text style={styles.title}>Wi-Fi Setup</Text>
                              </View>

                              <View style={styles.headerBottom}>
                                   <TouchableOpacity onPress={openGuide} style={styles.guideButton}>
                                        <Text style={styles.guideText}>Hướng dẫn</Text>
                                   </TouchableOpacity>
                              </View>
                         </View>

                         <Text style={styles.subtitle}>
                              Kết nối điện thoại với Wi-Fi của thiết bị, sau đó nhập mạng Wi-Fi bạn muốn thiết bị sử dụng.
                         </Text>

                         <NetworkStatusCard
                              isOnDeviceNetwork={isOnDeviceNetwork}
                              requiredDeviceWifi={requiredDeviceWifi}
                         />

                         <WifiFormCard
                              ssid={ssid}
                              password={password}
                              showPassword={showPassword}
                              isBusy={isBusy}
                              canSubmit={canSubmit}
                              isCheckingNetwork={isCheckingNetwork}
                              requiredDeviceWifi={requiredDeviceWifi}
                              onChangeSsid={setSsid}
                              onChangePassword={setPassword}
                              onTogglePassword={togglePassword}
                              onSubmit={() => {
                                   void handleSendWifi()
                              }}
                              onCheckNetwork={handleCheckNetwork}
                         />

                         <View style={styles.statusBox}>
                              <View style={[styles.dot, { backgroundColor: statusDisplay.color }]} />
                              <Text style={[styles.statusText, { color: statusDisplay.color }]}>{statusDisplay.label}</Text>
                         </View>

                         {!!message && (
                              <View style={styles.messageBox}>
                                   <Text style={styles.messageText}>{message}</Text>
                              </View>
                         )}
                    </ScrollView>
               </TouchableWithoutFeedback>

               <GuideModal
                    visible={isGuideOpen}
                    onClose={closeGuide}
                    requiredDeviceWifi={requiredDeviceWifi}
               />
          </KeyboardAvoidingView>
     )
}

const styles = StyleSheet.create({
     wrapper: {
          flex: 1,
          backgroundColor: "#f8fafc",
     },
     scrollContent: {
          padding: 20,
          paddingTop: 36,
          paddingBottom: 40,
     },
     header: {
          marginTop: 20,
          marginBottom: 10,
          gap: 8,
          flexDirection: 'row',
          justifyContent: 'space-between'
     },
     headerTop: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     backButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
     },
     title: {
          fontSize: 22,
          fontWeight: "700",
          color: "#0f172a",
     },
     headerBottom: {
          alignItems: "flex-end",
     },
     guideButton: {
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
     },
     guideText: {
          color: Colors.primary,
          fontWeight: "600",
     },
     subtitle: {
          color: "#475569",
          marginBottom: 16,
          lineHeight: 20,
     },
     statusBox: {
          marginTop: 16,
          backgroundColor: "#ffffff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     dot: {
          width: 10,
          height: 10,
          borderRadius: 100,
     },
     statusText: {
          fontWeight: "600",
     },
     messageBox: {
          marginTop: 16,
          backgroundColor: "#ffffff",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
     },
     messageText: {
          color: "#334155",
          fontSize: 13,
          lineHeight: 18,
     },
})
