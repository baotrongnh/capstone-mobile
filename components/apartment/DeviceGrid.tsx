import { IotBoardItem, IoTControlVariables } from "@/lib/services/iot.service"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useMemo } from "react"
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import ApartmentModal from "./ApartmentModal"
import DeviceCard from "./DeviceCard"
import DoorAccessCard from "./DoorAccessCard"

const toControlTopic = (mqttTopic: string | null | undefined): IoTControlVariables["topic"] | null => {
     if (mqttTopic === "light" || mqttTopic === "alarm" || mqttTopic === "door" || mqttTopic === "curtain") {
          return mqttTopic
     }

     return null
}

const mapTopicIcon = (topic: IoTControlVariables["topic"]): keyof typeof MaterialCommunityIcons.glyphMap => {
     if (topic === "curtain") return "curtains-closed"
     if (topic === "alarm") return "alarm-light-outline"

     return "lightbulb-outline"
}

export type DoorDeviceOption = {
     id: string
     espId: string
     deviceId: number
     label: string
}

type RenameTarget = {
     boardId: string
     deviceId: string
     currentName: string
}

interface DeviceGridProps {
     boards: IotBoardItem[]
     onDeviceToggle?: (data: IoTControlVariables) => void
     isRenamingDevice?: boolean
     doorPassword?: string | null
     isDoorPasswordLoading?: boolean
     isOpeningDoor?: boolean
     isChangingHousePassword?: boolean
     onOpenDoor: (device: DoorDeviceOption) => Promise<void>
     onRenameDevice: (payload: { boardId: string; deviceId: string; deviceName: string }) => Promise<void>
     onChangeHousePassword: (nextPassword: string) => Promise<void>
}

export default function DeviceGrid({
     boards,
     onDeviceToggle,
     isRenamingDevice,
     doorPassword,
     isDoorPasswordLoading,
     isOpeningDoor,
     isChangingHousePassword,
     onOpenDoor,
     onRenameDevice,
     onChangeHousePassword,
}: DeviceGridProps) {
     const [renameTarget, setRenameTarget] = React.useState<RenameTarget | null>(null)
     const [renameValue, setRenameValue] = React.useState("")
     const [isRenameModalVisible, setIsRenameModalVisible] = React.useState(false)

     const openRenameModal = React.useCallback((target: RenameTarget) => {
          setRenameTarget(target)
          setRenameValue(target.currentName)
          setIsRenameModalVisible(true)
     }, [])

     const closeRenameModal = React.useCallback(() => {
          if (isRenamingDevice) {
               return
          }
          setIsRenameModalVisible(false)
     }, [isRenamingDevice])

     const clearRenameModalState = React.useCallback(() => {
          setRenameTarget(null)
          setRenameValue("")
     }, [])

     const submitRename = React.useCallback(async () => {
          if (!renameTarget) {
               return
          }

          const nextName = renameValue.trim()
          if (!nextName) {
               Alert.alert("Thông báo", "Tên thiết bị không được để trống")
               return
          }

          await onRenameDevice({
               boardId: renameTarget.boardId,
               deviceId: renameTarget.deviceId,
               deviceName: nextName,
          })

          setIsRenameModalVisible(false)
     }, [onRenameDevice, renameTarget, renameValue])

     const { normalDevices, doorDevices } = useMemo(() => {
          const nextNormalDevices: {
               id: string
               boardId: string
               apiDeviceId: string
               title: string
               subtitle: string | undefined
               initial: boolean
               payload: IoTControlVariables
          }[] = []
          const nextDoorDevices: DoorDeviceOption[] = []

          boards.forEach((board) => {
               board.devices.forEach((device) => {
                    const topic = toControlTopic(device.mqttTopic)
                    const mqttDeviceId = device.mqttDeviceId

                    if (!device.isControllableByTenant || mqttDeviceId == null || !topic) {
                         return
                    }

                    if (topic === "door") {
                         nextDoorDevices.push({
                              id: device.id,
                              espId: board.id,
                              deviceId: mqttDeviceId,
                              label: device.deviceName || board.name || `Cửa ${mqttDeviceId}`,
                         })
                         return
                    }

                    nextNormalDevices.push({
                         id: device.id,
                         boardId: board.id,
                         apiDeviceId: device.id,
                         title: device.deviceName || `Thiết bị ${mqttDeviceId}`,
                         subtitle: device.room?.roomNumber ? `Phòng ${device.room.roomNumber}` : (board.name || undefined),
                         initial: device.mqttState === "ON",
                         payload: {
                              deviceId: mqttDeviceId,
                              action: "OFF",
                              espId: board.id,
                              topic,
                         },
                    })
               })
          })

          return {
               normalDevices: nextNormalDevices,
               doorDevices: nextDoorDevices,
          }
     }, [boards])

     return (
          <>
               {normalDevices.length > 0 ? (
                    <View style={styles.grid}>
                         {normalDevices.map((device) => (
                              <View key={device.id} style={styles.item}>
                                   <DeviceCard
                                        iconName={mapTopicIcon(device.payload.topic)}
                                        title={device.title}
                                        subtitle={device.subtitle}
                                        initial={device.initial}
                                        onLongPress={() =>
                                             openRenameModal({
                                                  boardId: device.boardId,
                                                  deviceId: device.apiDeviceId,
                                                  currentName: device.title,
                                             })
                                        }
                                        onToggle={(isOn) =>
                                             onDeviceToggle?.({
                                                  ...device.payload,
                                                  action: isOn ? "ON" : "OFF",
                                             })
                                        }
                                   />
                              </View>
                         ))}
                    </View>
               ) : null}

               <View style={styles.sectionBlock}>
                    <DoorAccessCard
                         title={doorDevices[0]?.label || "Cửa ra vào"}
                         doorDevices={doorDevices}
                         expectedPassword={doorPassword}
                         isDoorPasswordLoading={isDoorPasswordLoading}
                         isOpeningDoor={isOpeningDoor}
                         isChangingHousePassword={isChangingHousePassword}
                         onOpenDoor={onOpenDoor}
                         onRequestRenameDoor={(door) => {
                              openRenameModal({
                                   boardId: door.espId,
                                   deviceId: door.id,
                                   currentName: door.label,
                              })
                         }}
                         onChangeHousePassword={onChangeHousePassword}
                    />
               </View>

               <ApartmentModal
                    visible={isRenameModalVisible}
                    title="Đổi tên thiết bị"
                    onClose={closeRenameModal}
                    onAfterClose={clearRenameModalState}
                    disableBackdropClose={Boolean(isRenamingDevice)}
                    footer={
                         <>
                              <Pressable
                                   onPress={closeRenameModal}
                                   style={[styles.renameBtn, styles.renameCancelBtn]}
                                   disabled={isRenamingDevice}
                              >
                                   <Text style={styles.renameCancelText}>Hủy</Text>
                              </Pressable>
                              <Pressable
                                   onPress={() => void submitRename()}
                                   style={[styles.renameBtn, styles.renameSubmitBtn]}
                                   disabled={isRenamingDevice}
                              >
                                   {isRenamingDevice ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                   ) : (
                                        <Text style={styles.renameSubmitText}>Lưu</Text>
                                   )}
                              </Pressable>
                         </>
                    }
               >
                    <TextInput
                         value={renameValue}
                         onChangeText={setRenameValue}
                         placeholder="Nhập tên mới"
                         placeholderTextColor="#94a3b8"
                         style={styles.renameInput}
                         maxLength={60}
                    />
               </ApartmentModal>
          </>
     )
}

const styles = StyleSheet.create({
     grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
     },
     item: {
          width: "48.2%",
     },
     sectionBlock: {
          gap: 10,
     },
     renameInput: {
          borderWidth: 1,
          borderColor: "#dbe5f3",
          borderRadius: 12,
          backgroundColor: "#f8fafc",
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: "#0f172a",
          fontSize: 14,
     },
     renameBtn: {
          minWidth: 96,
          minHeight: 38,
          borderRadius: 12,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
     },
     renameCancelBtn: {
          backgroundColor: "#eef2f7",
          borderWidth: 1,
          borderColor: "#dbe5f3",
     },
     renameCancelText: {
          color: "#334155",
          fontWeight: "700",
     },
     renameSubmitBtn: {
          backgroundColor: "#2563eb",
     },
     renameSubmitText: {
          color: "#ffffff",
          fontWeight: "700",
     },
})