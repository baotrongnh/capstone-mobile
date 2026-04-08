import ApartmentSelector from '@/components/apartment/ApartmentSelector'
import DeviceGrid, { type DoorDeviceOption } from '@/components/apartment/DeviceGrid'
import { StyledContainer } from '@/components/styles'
import { useIotBoards, useDeviceIot, useUpdateIotBoardDevice } from '@/hooks/query/useDevices'
import { useUpdateMyHousePassword, useUserApartment, useUserApartmentDetail } from '@/hooks/query/useUserApartment'
import { IoTControlVariables } from '@/lib/services/iot.service'
import { storage } from '@/stores/storage'
import { UserApartmentItem } from '@/types/userApartment'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const APARTMENT_STORAGE_KEY = 'selectedApartmentId'

export default function ApartmentControlScreen() {
     const router = useRouter()
     const { mutate } = useDeviceIot()
     const { mutateAsync: openDoorMutation, isPending: isOpeningDoor } = useDeviceIot()
     const { mutateAsync: renameDeviceMutation, isPending: isRenamingDevice } = useUpdateIotBoardDevice()
     const { mutateAsync: updateHousePasswordMutation, isPending: isChangingHousePassword } = useUpdateMyHousePassword()

     const [selectedApartmentId, setSelectedApartmentId] = useState('')
     const [isHydratedStorage, setIsHydratedStorage] = useState(false)

     const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()

     const myApartments = useMemo<UserApartmentItem[]>(() => {
          return (apartmentData?.data as UserApartmentItem[] | undefined) ?? []
     }, [apartmentData?.data])

     const selectedUserApartmentId = useMemo(() => {
          const selected = myApartments.find((item) => String(item.apartmentId) === selectedApartmentId)
          return selected ? String(selected.id) : ''
     }, [myApartments, selectedApartmentId])

     const {
          data: userApartmentDetailData,
          isLoading: isApartmentDetailLoading,
          refetch: refetchUserApartmentDetail,
     } = useUserApartmentDetail(selectedUserApartmentId)

     const apartmentDoorPassword = userApartmentDetailData?.data?.apartmentDoorPassword ?? null

     const syncSelectedApartmentFromStorage = useCallback(async () => {
          const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
          const nextSelectedApartmentId = savedApartmentId ?? ''

          setSelectedApartmentId((prev) => (prev === nextSelectedApartmentId ? prev : nextSelectedApartmentId))
          setIsHydratedStorage(true)
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

               setSelectedApartmentId('')
               void storage.removeItem(APARTMENT_STORAGE_KEY)
               return
          }

          const isValidSelection = myApartments.some((item) => String(item.apartmentId) === selectedApartmentId)
          const nextSelectedApartmentId = isValidSelection
               ? selectedApartmentId
               : String(myApartments[0].apartmentId)

          if (nextSelectedApartmentId === selectedApartmentId) {
               return
          }

          setSelectedApartmentId(nextSelectedApartmentId)
          void storage.setItem(APARTMENT_STORAGE_KEY, nextSelectedApartmentId)
     }, [isApartmentLoading, isHydratedStorage, myApartments, selectedApartmentId])

     const {
          data: boardsData,
          isLoading: isBoardsLoading,
          refetch: refetchBoards,
     } = useIotBoards(selectedApartmentId || undefined)

     const boards = useMemo(() => boardsData?.data ?? [], [boardsData?.data])

     useEffect(() => {
          if (!selectedApartmentId) {
               return
          }

          console.log('[APARTMENT] selectedApartmentId:', selectedApartmentId)
          console.log('[APARTMENT] boards:', boards)
     }, [boards, selectedApartmentId])

     const onSelectApartment = (apartmentId: string) => {
          setSelectedApartmentId(apartmentId)

          if (!apartmentId) {
               void storage.removeItem(APARTMENT_STORAGE_KEY)
               return
          }

          void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
     }

     const onDeviceToggle = (data: IoTControlVariables) => {
          mutate({
               espId: data.espId,
               deviceId: data.deviceId,
               topic: data.topic,
               action: data.action,
          })
          console.log(data.espId, data.deviceId, data.topic, data.action)
     }

     const handleOpenDoor = useCallback(async (doorDevice: DoorDeviceOption) => {
          await openDoorMutation({
               espId: doorDevice.espId,
               deviceId: doorDevice.deviceId,
               topic: 'door',
               action: 'ON',
          })
     }, [openDoorMutation])

     const handleChangeHousePassword = useCallback(async (nextPassword: string) => {
          if (!selectedUserApartmentId) {
               throw new Error('Không xác định được căn hộ để đổi mật khẩu')
          }

          await updateHousePasswordMutation({
               id: selectedUserApartmentId,
               payload: { housePassword: nextPassword },
          })

          await refetchUserApartmentDetail()
     }, [refetchUserApartmentDetail, selectedUserApartmentId, updateHousePasswordMutation])

     const handleRenameDevice = useCallback(async ({ boardId, deviceId, deviceName }: { boardId: string; deviceId: string; deviceName: string }) => {
          await renameDeviceMutation({
               boardId,
               deviceId,
               payload: { deviceName },
          })

          await refetchBoards()
     }, [refetchBoards, renameDeviceMutation])

     const onOpenWifiSetup = () => {
          router.navigate('/wifi-setup')
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
                              onPress={onOpenWifiSetup}
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
                                   onDeviceToggle={onDeviceToggle}
                                   isRenamingDevice={isRenamingDevice}
                                   doorPassword={apartmentDoorPassword}
                                   isDoorPasswordLoading={isApartmentDetailLoading}
                                   isOpeningDoor={isOpeningDoor}
                                   isChangingHousePassword={isChangingHousePassword}
                                   onOpenDoor={handleOpenDoor}
                                   onRenameDevice={handleRenameDevice}
                                   onChangeHousePassword={handleChangeHousePassword}
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