import ApartmentSelector from '@/components/apartment/apartment-selector'
import DeviceGrid, { type DoorDeviceOption } from '@/components/device/device-grid'
import { StyledContainer } from '@/components/styles'
import { useCheckDeviceHealth, useDeviceIot, useDoorUnlock, useIotBoards, useUpdateDoorPin, useUpdateIotBoardDevice } from '@/hooks/query/useDevices'
import { useUserApartment } from '@/hooks/query/useUserApartment'
import { IoTControlVariables } from '@/lib/services/iot.service'
import { storage } from '@/stores/storage'
import { UserApartmentItem } from '@/types/userApartment'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'

const APARTMENT_STORAGE_KEY = 'selectedApartmentId'

export default function ApartmentControlScreen() {
     const router = useRouter()
     const { mutateAsync: toggleDeviceMutation } = useDeviceIot()
     const { mutateAsync: unlockDoorMutation, isPending: isOpeningDoor } = useDoorUnlock()
     const { mutateAsync: updateDoorPinMutation, isPending: isChangingDoorPin } = useUpdateDoorPin()
     const { mutateAsync: checkDeviceHealthMutation } = useCheckDeviceHealth()
     const { mutateAsync: renameDeviceMutation, isPending: isRenamingDevice } = useUpdateIotBoardDevice()

     const [selectedApartmentId, setSelectedApartmentId] = useState('')
     const [isHydratedStorage, setIsHydratedStorage] = useState(false)
     const [boardOnlineMap, setBoardOnlineMap] = useState<Record<string, boolean>>({})
     const [isRefreshing, setIsRefreshing] = useState(false)

     const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
     const myApartments = useMemo<UserApartmentItem[]>(() => {
          return (apartmentData?.data as UserApartmentItem[] | undefined) ?? []
     }, [apartmentData?.data])

     const syncSelectedApartmentFromStorage = useCallback(async () => {
          const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
          const nextSelectedApartmentId = savedApartmentId ?? ''

          setSelectedApartmentId((prev) => (prev === nextSelectedApartmentId ? prev : nextSelectedApartmentId))
          setIsHydratedStorage(true)
     }, [])

     const onSelectApartment = useCallback((apartmentId: string) => {
          setSelectedApartmentId((prev) => (prev === apartmentId ? prev : apartmentId))

          if (!apartmentId) {
               void storage.removeItem(APARTMENT_STORAGE_KEY)
               return
          }

          void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
     }, [])

     useEffect(() => {
          void syncSelectedApartmentFromStorage()
     }, [syncSelectedApartmentFromStorage])

     useFocusEffect(
          useCallback(() => {
               void syncSelectedApartmentFromStorage()
          }, [syncSelectedApartmentFromStorage]),
     )

     useEffect(() => {
          if (!isHydratedStorage || isApartmentLoading) {
               return
          }

          if (myApartments.length === 0) {
               if (!selectedApartmentId) {
                    return
               }

               onSelectApartment('')
               return
          }

          const isValidSelection = myApartments.some((item) => String(item.apartmentId) === selectedApartmentId)
          if (isValidSelection) {
               return
          }

          onSelectApartment(String(myApartments[0].apartmentId))
     }, [isApartmentLoading, isHydratedStorage, myApartments, onSelectApartment, selectedApartmentId])

     const {
          data: boardsData,
          isLoading: isBoardsLoading,
          refetch: refetchBoards,
     } = useIotBoards(selectedApartmentId || undefined)

     const boards = useMemo(() => boardsData?.data ?? [], [boardsData?.data])

     const refreshBoardHealthMap = useCallback(async (targetBoards = boards) => {
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
     }, [boards, checkDeviceHealthMutation])

     useEffect(() => {
          void refreshBoardHealthMap(boards)
     }, [boards, refreshBoardHealthMap])

     useFocusEffect(
          useCallback(() => {
               void refreshBoardHealthMap(boards)
          }, [boards, refreshBoardHealthMap]),
     )

     const onRefresh = useCallback(async () => {
          if (!selectedApartmentId) {
               return
          }

          setIsRefreshing(true)
          try {
               const nextBoards = await refetchBoards()
               await refreshBoardHealthMap(nextBoards.data?.data ?? boards)
          } finally {
               setIsRefreshing(false)
          }
     }, [boards, refreshBoardHealthMap, refetchBoards, selectedApartmentId])

     const isMutationSuccess = (response?: { data?: { success?: boolean } }) => Boolean(response?.data?.success)
     const isBoardOffline = (espId: string) => boardOnlineMap[espId] === false

     const actions = {
          toggleDevice: async (data: IoTControlVariables) => {
               if (isBoardOffline(data.espId)) {
                    return false
               }

               const response = await toggleDeviceMutation(data)
               const isSuccess = isMutationSuccess(response)

               if (isSuccess) {
                    await refetchBoards()
               }

               return isSuccess
          },
          openDoor: async (doorDevice: DoorDeviceOption, pin: string) => {
               if (isBoardOffline(doorDevice.espId)) {
                    return false
               }

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
               if (isBoardOffline(doorDevice.espId)) {
                    return false
               }

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
                              apartments={myApartments}
                              selectedApartmentId={selectedApartmentId}
                              onSelectApartment={onSelectApartment}
                              onViewApartments={() => router.push('/my-apartments')}
                         />
                    </View>

                    <View style={styles.sectionBlock}>
                         <Text style={styles.sectionTitle}>Thiết lập thiết bị</Text>
                         <Pressable
                              onPress={() => router.navigate('/wifi-setup')}
                              style={({ pressed }) => [styles.wifiSetupCard, pressed && styles.wifiSetupCardPressed]}
                         >
                              <View style={styles.wifiSetupIconWrap}>
                                   <MaterialCommunityIcons name="wifi-cog" size={22} color="#2563eb" />
                              </View>

                              <View style={styles.wifiSetupContent}>
                                   <Text style={styles.wifiSetupTitle}>Wi-Fi</Text>
                                   <Text style={styles.wifiSetupSubtitle}>Cấu hình mạng cho HOME-IQ-HUB</Text>
                              </View>

                              <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
                         </Pressable>
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
                              />
                         )}
                    </View>
               </ScrollView>

          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: '#f3f5f9',
          paddingHorizontal: 10,
     },
     loadingWrap: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
     },
     loadingText: {
          fontSize: 14,
          color: '#475569',
          fontWeight: '600',
     },
     content: {
          paddingBottom: 130,
          gap: 14,
     },
     sectionBlock: {
          gap: 10,
     },
     emptyCard: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 18,
          padding: 14,
          gap: 8,
     },
     emptyText: {
          fontSize: 13,
          color: '#64748b',
     },
     sectionTitle: {
          fontSize: 19,
          fontWeight: '700',
          color: '#0f172a',
     },
     wifiSetupCard: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
     },
     wifiSetupCardPressed: {
          opacity: 0.82,
     },
     wifiSetupIconWrap: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#eff6ff',
          alignItems: 'center',
          justifyContent: 'center',
     },
     wifiSetupContent: {
          flex: 1,
          gap: 2,
     },
     wifiSetupTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: '#0f172a',
     },
     wifiSetupSubtitle: {
          fontSize: 13,
          color: '#64748b',
     },
     loadingInline: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
     },
     loadingInlineText: {
          fontSize: 13,
          color: '#64748b',
          fontWeight: '600',
     },
})