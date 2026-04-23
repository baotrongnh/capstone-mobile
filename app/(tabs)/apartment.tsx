import ApartmentSelector from "@/components/apartment/apartment-selector"
import DeviceGrid, { type DoorDeviceOption } from "@/components/device/device-grid"
import { StyledContainer } from "@/components/styles"
import {
     useCheckDeviceHealth,
     useDeviceIot,
     useDoorUnlock,
     useIotBoards,
     useUpdateDoorPin,
     useUpdateIotBoardDevice,
} from "@/hooks/query/useDevices"
import { useUserApartment } from "@/hooks/query/useUserApartment"
import { IoTControlVariables, type IotBoardItem } from "@/lib/services/iot.service"
import { storage } from "@/stores/storage"
import type { UserApartmentItem } from "@/types/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"

const APARTMENT_STORAGE_KEY = "selectedApartmentId"

const isMutationSuccess = (response?: { data?: { success?: boolean } }) => Boolean(response?.data?.success)

export default function ApartmentControlScreen() {
     const router = useRouter()

     const { mutateAsync: toggleDeviceMutation } = useDeviceIot()
     const { mutateAsync: unlockDoorMutation, isPending: isOpeningDoor } = useDoorUnlock()
     const { mutateAsync: updateDoorPinMutation, isPending: isChangingDoorPin } = useUpdateDoorPin()
     const { mutateAsync: checkDeviceHealthMutation } = useCheckDeviceHealth()
     const { mutateAsync: renameDeviceMutation, isPending: isRenamingDevice } = useUpdateIotBoardDevice()

     const [selectedApartmentId, setSelectedApartmentId] = useState("")
     const [isHydratedStorage, setIsHydratedStorage] = useState(false)
     const [boardOnlineMap, setBoardOnlineMap] = useState<Record<string, boolean>>({})
     const [isRefreshing, setIsRefreshing] = useState(false)

     const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
     const {
          data: boardsData,
          isLoading: isBoardsLoading,
          refetch: refetchBoards,
     } = useIotBoards(selectedApartmentId || undefined)

     const myApartments = apartmentData?.data as UserApartmentItem[] | undefined
     const boards = useMemo(() => boardsData?.data ?? [], [boardsData?.data])

     const saveSelectedApartment = useCallback((apartmentId: string) => {
          setSelectedApartmentId(apartmentId)

          if (apartmentId) {
               void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
               return
          }

          void storage.removeItem(APARTMENT_STORAGE_KEY)
     }, [])

     function onSelectApartment(apartmentId: string) {
          saveSelectedApartment(apartmentId)
     }

     const syncBoardHealth = useCallback(async (targetBoards: IotBoardItem[]) => {
          if (!targetBoards.length) {
               setBoardOnlineMap({})
               return
          }

          const healthEntries = await Promise.all(
               targetBoards.map(async (board) => {
                    const response = await checkDeviceHealthMutation({ espId: board.id }).catch(() => null)
                    return [board.id, Boolean(response?.data?.online)] as const
               }),
          )

          setBoardOnlineMap(Object.fromEntries(healthEntries))
     }, [checkDeviceHealthMutation])

     async function onRefresh() {
          if (!selectedApartmentId) return

          setIsRefreshing(true)
          try {
               const nextBoardsResponse = await refetchBoards()
               await syncBoardHealth(nextBoardsResponse.data?.data ?? [])
          } finally {
               setIsRefreshing(false)
          }
     }

     function isBoardOffline(espId: string) {
          return boardOnlineMap[espId] === false
     }

     useEffect(() => {
          let cancelled = false

          async function hydrate() {
               const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
               if (cancelled) return

               setSelectedApartmentId(savedApartmentId ?? "")
               setIsHydratedStorage(true)
          }

          void hydrate()

          return () => {
               cancelled = true
          }
     }, [])

     useEffect(() => {
          if (!isHydratedStorage || isApartmentLoading) return

          const apartments = myApartments ?? []

          if (!apartments.length) {
               if (selectedApartmentId) {
                    saveSelectedApartment("")
               }
               return
          }

          const hasSelection = apartments.some((item) => String(item.apartmentId) === selectedApartmentId)
          if (hasSelection) return

          saveSelectedApartment(String(apartments[0].apartmentId))
     }, [isApartmentLoading, isHydratedStorage, myApartments, saveSelectedApartment, selectedApartmentId])

     useEffect(() => {
          let cancelled = false

          async function loadBoardHealth() {
               await syncBoardHealth(boards)

               if (cancelled) return
          }

          void loadBoardHealth()

          return () => {
               cancelled = true
          }
     }, [boards, syncBoardHealth])

     const actions = {
          toggleDevice: async (data: IoTControlVariables) => {
               if (isBoardOffline(data.espId)) return false

               const response = await toggleDeviceMutation(data)
               const success = isMutationSuccess(response)

               if (success) {
                    await refetchBoards()
               }

               return success
          },

          openDoor: async (doorDevice: DoorDeviceOption, pin: string) => {
               if (isBoardOffline(doorDevice.espId)) return false

               const response = await unlockDoorMutation({
                    boardId: doorDevice.espId,
                    deviceId: doorDevice.deviceId,
                    pin,
               })

               return isMutationSuccess(response)
          },

          changeDoorPassword: async ({
               doorDevice,
               oldPin,
               newPin,
          }: {
               doorDevice: DoorDeviceOption
               oldPin: string
               newPin: string
          }) => {
               if (isBoardOffline(doorDevice.espId)) return false

               const response = await updateDoorPinMutation({
                    boardId: doorDevice.espId,
                    deviceId: doorDevice.deviceId,
                    payload: { oldPin, newPin },
               })

               return isMutationSuccess(response)
          },

          renameDevice: async ({ boardId, deviceId, deviceName }: { boardId: string; deviceId: string; deviceName: string }) => {
               await renameDeviceMutation({
                    boardId,
                    deviceId,
                    payload: { deviceName },
               })

               await refetchBoards()
          },
     }

     const pending = {
          renaming: isRenamingDevice,
          openingDoor: isOpeningDoor,
          changingDoorPin: isChangingDoorPin,
     }

     if (!isHydratedStorage || isApartmentLoading) {
          return (
               <StyledContainer style={styles.container}>
                    <View style={styles.loadingWrap}>
                         <ActivityIndicator size="large" color="#2563eb" />
                         <Text style={styles.loadingText}>Đang tải căn hộ của bạn...</Text>
                    </View>
               </StyledContainer>
          )
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                         <RefreshControl
                              refreshing={isRefreshing}
                              onRefresh={() => {
                                   void onRefresh()
                              }}
                              tintColor="#2563eb"
                         />
                    }
               >
                    <View style={styles.sectionBlock}>
                         <ApartmentSelector
                              apartments={myApartments ?? []}
                              selectedApartmentId={selectedApartmentId}
                              onSelectApartment={onSelectApartment}
                              onViewApartments={() => router.push("/my-apartments")}
                         />
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Thiết lập thiết bị</Text>

                         <View style={styles.setupRow}>
                              <Pressable
                                   onPress={() => router.navigate("/wifi-setup")}
                                   style={({ pressed }) => [styles.setupTile, pressed && styles.setupTilePressed]}
                              >
                                   <View style={styles.setupTileIconWrap}>
                                        <MaterialCommunityIcons name="wifi-cog" size={20} color="#2563eb" />
                                   </View>
                                   <Text style={styles.setupTileTitle}>Wi-Fi</Text>
                                   <Text style={styles.setupTileSubtitle}>Cấu hình mạng</Text>
                              </Pressable>

                              <Pressable
                                   onPress={() => router.navigate("/quick-scenarios")}
                                   style={({ pressed }) => [styles.setupTile, pressed && styles.setupTilePressed]}
                              >
                                   <View style={styles.setupTileIconWrap}>
                                        <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color="#2563eb" />
                                   </View>
                                   <Text style={styles.setupTileTitle}>Kịch bản nhanh</Text>
                                   <Text style={styles.setupTileSubtitle}>Mở danh sách kịch bản</Text>
                              </Pressable>
                         </View>
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Thiết bị trong nhà</Text>

                         {!selectedApartmentId ? (
                              <View style={styles.emptyCard}>
                                   <Text style={styles.emptyText}>Chọn căn hộ trước để tải danh sách thiết bị.</Text>
                              </View>
                         ) : isBoardsLoading ? (
                              <View style={styles.loadingInline}>
                                   <ActivityIndicator size="small" color="#2563eb" />
                                   <Text style={styles.loadingInlineText}>Đang tải mạch và thiết bị...</Text>
                              </View>
                         ) : (
                              <DeviceGrid
                                   boards={boards}
                                   boardOnlineMap={boardOnlineMap}
                                   pending={pending}
                                   actions={actions}
                                   onViewDoorHistory={() => router.push("/door-history")}
                              />
                         )}
                    </View>
               </ScrollView>
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: "#f3f5f9",
          paddingHorizontal: 10,
     },
     loadingWrap: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
     },
     loadingText: {
          fontSize: 14,
          color: "#475569",
          fontWeight: "600",
     },
     content: {
          paddingBottom: 130,
          gap: 14,
     },
     sectionBlock: {
          gap: 10,
     },
     emptyCard: {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 18,
          padding: 14,
          gap: 8,
     },
     emptyText: {
          fontSize: 13,
          color: "#64748b",
     },
     sectionTitle: {
          fontSize: 19,
          fontWeight: "700",
          color: "#0f172a",
     },
     setupRow: {
          flexDirection: "row",
          gap: 10,
     },
     setupTile: {
          flex: 1,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 12,
          minHeight: 108,
          gap: 6,
     },
     setupTilePressed: {
          opacity: 0.82,
     },
     setupTileIconWrap: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#eff6ff",
          alignItems: "center",
          justifyContent: "center",
     },
     setupTileTitle: {
          fontSize: 14,
          fontWeight: "700",
          color: "#0f172a",
     },
     setupTileSubtitle: {
          fontSize: 12,
          color: "#64748b",
     },
     loadingInline: {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 18,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
     },
     loadingInlineText: {
          fontSize: 13,
          color: "#64748b",
          fontWeight: "600",
     },
})
