import { MaterialCommunityIcons } from '@expo/vector-icons'
import { UserApartmentItem } from '@/types/userApartment'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const getApartmentId = (item: UserApartmentItem) => String(item.apartmentId)
const getApartmentLabel = (item: UserApartmentItem) => item.apartment?.apartmentNumber || String(item.apartmentId)

type ApartmentSelectorProps = {
     apartments: UserApartmentItem[]
     selectedApartmentId: string
     onSelectApartment: (apartmentId: string) => void
     onViewApartments: () => void
}

export default function ApartmentSelector({
     apartments,
     selectedApartmentId,
     onSelectApartment,
     onViewApartments,
}: ApartmentSelectorProps) {
     const [isModalVisible, setIsModalVisible] = useState(false)
     const overlayOpacity = useRef(new Animated.Value(0)).current
     const sheetTranslateY = useRef(new Animated.Value(280)).current
     const isMultiple = apartments.length > 1

     const selectedApartment = apartments.find((item) => getApartmentId(item) === selectedApartmentId)
     const selectedApartmentLabel = selectedApartment ? getApartmentLabel(selectedApartment) : ''

     useEffect(() => {
          if (!isMultiple && isModalVisible) {
               setIsModalVisible(false)
          }
     }, [isModalVisible, isMultiple])

     const openSelectModal = () => {
          setIsModalVisible(true)

          Animated.parallel([
               Animated.timing(overlayOpacity, {
                    toValue: 0.34,
                    duration: 180,
                    useNativeDriver: true,
               }),
               Animated.spring(sheetTranslateY, {
                    toValue: 0,
                    damping: 18,
                    stiffness: 220,
                    mass: 0.8,
                    useNativeDriver: true,
               }),
          ]).start()
     }

     const closeSelectModal = () => {
          Animated.parallel([
               Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 140,
                    useNativeDriver: true,
               }),
               Animated.timing(sheetTranslateY, {
                    toValue: 280,
                    duration: 170,
                    useNativeDriver: true,
               }),
          ]).start(({ finished }) => {
               if (finished) {
                    setIsModalVisible(false)
               }
          })
     }

     if (apartments.length === 0) {
          return (
               <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Bạn chưa có căn hộ để điều khiển</Text>
                    <Text style={styles.emptyText}>Vui lòng liên hệ ban quản lý hoặc kiểm tra lại quyền truy cập.</Text>

                    <Pressable onPress={onViewApartments} style={styles.linkButton}>
                         <Text style={styles.linkButtonText}>Xem danh sách căn hộ</Text>
                    </Pressable>
               </View>
          )
     }

     return (
          <>
               <View style={styles.selectedCard}>
                    <View style={styles.selectedRow}>
                         <View style={styles.selectedContent}>
                              <Text style={styles.selectedTitle}>Căn hộ</Text>
                              <Text numberOfLines={1} style={styles.selectedValue}>
                                   {selectedApartmentLabel || 'Chưa chọn căn hộ'}
                              </Text>
                         </View>

                         {isMultiple ? (
                              <Pressable onPress={openSelectModal} style={styles.changeButton}>
                                   <Text style={styles.changeButtonText}>Thay đổi</Text>
                                   <MaterialCommunityIcons name="chevron-down" size={15} color="#2563eb" />
                              </Pressable>
                         ) : null}
                    </View>

                    {!selectedApartmentId ? (
                         <Text style={styles.helperText}>Vui lòng chọn căn hộ để điều khiển thiết bị.</Text>
                    ) : null}
               </View>

               <Modal
                    visible={isModalVisible}
                    transparent
                    animationType="none"
                    onRequestClose={closeSelectModal}
               >
                    <View style={styles.modalRoot}>
                         <Pressable style={styles.modalOverlayPress} onPress={closeSelectModal}>
                              <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]} />
                         </Pressable>

                         <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}>
                              <View style={styles.sheetHandle} />
                              <Text style={styles.sheetTitle}>Chọn căn hộ</Text>

                              <ScrollView contentContainerStyle={styles.sheetList} showsVerticalScrollIndicator={false}>
                                   {apartments.map((item) => {
                                        const apartmentId = getApartmentId(item)
                                        const isActive = apartmentId === selectedApartmentId

                                        return (
                                             <Pressable
                                                  key={apartmentId}
                                                  onPress={() => {
                                                       onSelectApartment(apartmentId)
                                                       closeSelectModal()
                                                  }}
                                                  style={[styles.sheetOption, isActive && styles.sheetOptionActive]}
                                             >
                                                  <Text numberOfLines={1} style={[styles.sheetOptionText, isActive && styles.sheetOptionTextActive]}>
                                                       {getApartmentLabel(item)}
                                                  </Text>

                                                  {isActive ? (
                                                       <MaterialCommunityIcons name="check-circle" size={18} color="#1d4ed8" />
                                                  ) : null}
                                             </Pressable>
                                        )
                                   })}
                              </ScrollView>

                              <View style={styles.sheetActions}>
                                   <Pressable
                                        onPress={() => {
                                             closeSelectModal()
                                             onViewApartments()
                                        }}
                                        style={styles.sheetViewAllButton}
                                   >
                                        <Text style={styles.sheetViewAllText}>Xem tất cả căn hộ</Text>
                                   </Pressable>

                                   <Pressable onPress={closeSelectModal} style={styles.sheetCloseButton}>
                                        <Text style={styles.sheetCloseButtonText}>Đóng</Text>
                                   </Pressable>
                              </View>
                         </Animated.View>
                    </View>
               </Modal>
          </>
     )
}

const styles = StyleSheet.create({
     helperText: {
          fontSize: 12,
          color: '#64748b',
     },
     selectedCard: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 6,
     },
     selectedRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
     },
     selectedContent: {
          flex: 1,
          gap: 3,
     },
     selectedTitle: {
          fontSize: 12,
          color: '#64748b',
          fontWeight: '600',
     },
     selectedValue: {
          paddingTop: 2,
          fontSize: 14,
          color: '#0f172a',
          fontWeight: '700',
     },
     changeButton: {
          borderRadius: 999,
          paddingHorizontal: 9,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: '#bfdbfe',
          backgroundColor: '#eff6ff',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
     },
     changeButtonText: {
          fontSize: 11,
          color: '#2563eb',
          fontWeight: '700',
     },
     emptyCard: {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 18,
          padding: 14,
          gap: 8,
     },
     emptyTitle: {
          fontSize: 15,
          color: '#0f172a',
          fontWeight: '700',
     },
     emptyText: {
          fontSize: 13,
          color: '#64748b',
     },
     linkButton: {
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: '#eff6ff',
          marginTop: 15
     },
     linkButtonText: {
          fontSize: 12,
          fontWeight: '700',
          color: '#2563eb',
          margin: 'auto',
          paddingVertical: 5
     },
     modalRoot: {
          flex: 1,
          justifyContent: 'flex-end',
     },
     modalOverlayPress: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'flex-end',
     },
     modalOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: '#656566',
     },
     sheetContainer: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 18,
          maxHeight: '62%',
     },
     sheetHandle: {
          width: 42,
          height: 4,
          borderRadius: 999,
          backgroundColor: '#cbd5e1',
          alignSelf: 'center',
          marginBottom: 10,
     },
     sheetTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: 10,
     },
     sheetList: {
          gap: 8,
          paddingBottom: 12,
     },
     sheetOption: {
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 12,
          paddingHorizontal: 12,
          minHeight: 46,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
     },
     sheetOptionActive: {
          borderColor: '#bfdbfe',
          backgroundColor: '#eff6ff',
     },
     sheetOptionText: {
          flex: 1,
          marginRight: 8,
          fontSize: 13,
          fontWeight: '600',
          color: '#334155',
     },
     sheetOptionTextActive: {
          color: '#1d4ed8',
     },
     sheetCloseButton: {
          flex: 1,
          borderRadius: 12,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#e2e8f0',
     },
     sheetCloseButtonText: {
          fontSize: 14,
          fontWeight: '700',
          color: '#334155',
     },
     sheetActions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
     },
     sheetViewAllButton: {
          flex: 1,
          borderRadius: 12,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#bfdbfe',
          backgroundColor: '#eff6ff',
     },
     sheetViewAllText: {
          fontSize: 13,
          fontWeight: '700',
          color: '#2563eb',
     },
})
