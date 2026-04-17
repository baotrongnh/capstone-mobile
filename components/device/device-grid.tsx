import { IotBoardItem, IoTControlVariables } from "@/lib/services/iot.service"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import ApartmentModal from "../apartment/apartment-modal"
import DoorAccessCard from "../door/door-access-card"
import DeviceCard from "./device-card"

const toControlTopic = (topic: string | null | undefined): IoTControlVariables["topic"] | null => {
     if (
          topic === "light" ||
          topic === "alarm" ||
          topic === "door" ||
          topic === "curtain" ||
          topic === "electric" ||
          topic === "water"
     ) { return topic }

     return null
}

const mapTopicIcon = (topic: IoTControlVariables["topic"]): keyof typeof MaterialCommunityIcons.glyphMap => {
     if (topic === "curtain") return "curtains-closed"
     if (topic === "alarm") return "alarm-light-outline"
     if (topic === "water") return "water-outline"
     if (topic === "electric") return "flash-outline"

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

type DeviceGridActions = {
     toggleDevice: (data: IoTControlVariables) => Promise<boolean>
     renameDevice: (payload: { boardId: string; deviceId: string; deviceName: string }) => Promise<void>
     openDoor: (device: DoorDeviceOption, pin: string) => Promise<boolean>
     changeDoorPassword: (payload: { doorDevice: DoorDeviceOption; oldPin: string; newPin: string }) => Promise<boolean>
}

type DeviceGridPending = {
     renaming?: boolean
     openingDoor?: boolean
     changingDoorPin?: boolean
}

interface DeviceGridProps {
     boards: IotBoardItem[]
     boardOnlineMap?: Record<string, boolean>
     actions: DeviceGridActions
     pending?: DeviceGridPending
}

type NormalDevice = {
     id: string
     boardId: string
     apiDeviceId: string
     title: string
     subtitle: string | undefined
     isOn: boolean
     disabled: boolean
     payload: IoTControlVariables
}

const buildDeviceGroups = (
     boards: IotBoardItem[],
     boardOnlineMap: Record<string, boolean>
): { normalDevices: NormalDevice[]; doorDevices: DoorDeviceOption[] } => {
     const normalDevices: NormalDevice[] = []
     const doorDevices: DoorDeviceOption[] = []

     for (const board of boards) {
          const isBoardOffline = boardOnlineMap[board.id] === false

          for (const device of board.devices) {
               const topic = toControlTopic(device.topic)
               if (!topic || device.deviceId == null) continue

               if (topic === "door") {
                    doorDevices.push({
                         id: device.id,
                         espId: board.id,
                         deviceId: device.deviceId,
                         label: device.deviceName || board.name || `Cửa ${device.deviceId}`,
                    })
                    continue
               }

               if (topic === "alarm") continue

               normalDevices.push({
                    id: device.id,
                    boardId: board.id,
                    apiDeviceId: device.id,
                    title: device.deviceName || `Thiết bị ${device.deviceId}`,
                    subtitle: board.name || undefined,
                    isOn: device.state === "ON",
                    disabled: isBoardOffline,
                    payload: {
                         deviceId: device.deviceId,
                         action: "OFF",
                         espId: board.id,
                         topic,
                    },
               })
          }
     }

     return { normalDevices, doorDevices }
}

export default function DeviceGrid({
     boards,
     boardOnlineMap = {},
     actions,
     pending = {},
}: DeviceGridProps) {
     const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null)
     const [renameValue, setRenameValue] = useState("")
     const [isRenameModalVisible, setIsRenameModalVisible] = useState(false)
     const [deviceLoadingMap, setDeviceLoadingMap] = useState<Record<string, boolean>>({})

     const openRenameModal = (target: RenameTarget) => {
          setRenameTarget(target)
          setRenameValue(target.currentName)
          setIsRenameModalVisible(true)
     }

     const closeRenameModal = () => {
          if (pending.renaming) {
               return
          }
          setIsRenameModalVisible(false)
     }

     const clearRenameModalState = () => {
          setRenameTarget(null)
          setRenameValue("")
     }

     const submitRename = async () => {
          if (!renameTarget) {
               return
          }

          const nextName = renameValue.trim()
          if (!nextName) {
               Alert.alert("Thông báo", "Tên thiết bị không được để trống")
               return
          }

          await actions.renameDevice({
               boardId: renameTarget.boardId,
               deviceId: renameTarget.deviceId,
               deviceName: nextName,
          })

          setIsRenameModalVisible(false)
     }

     const { normalDevices, doorDevices } = useMemo(
          () => buildDeviceGroups(boards, boardOnlineMap),
          [boardOnlineMap, boards]
     )

     const handleToggle = async (
          device: {
               id: string
               disabled: boolean
               payload: IoTControlVariables
          },
          nextValue: boolean,
     ) => {
          if (device.disabled || deviceLoadingMap[device.id]) {
               return
          }

          setDeviceLoadingMap((prev) => ({
               ...prev,
               [device.id]: true,
          }))

          try {
               const isSuccess = await actions.toggleDevice({
                    ...device.payload,
                    action: nextValue ? "ON" : "OFF",
               })

               if (!isSuccess) {
                    Alert.alert("Thông báo", "Thiết bị không phản hồi")
               }
          } catch {
               Alert.alert("Lỗi", "Không thể điều khiển thiết bị lúc này")
          } finally {
               setDeviceLoadingMap((prev) => ({
                    ...prev,
                    [device.id]: false,
               }))
          }
     }

     return (
          <>
               {doorDevices.length > 0 &&
                    <View style={styles.sectionBlock}>
                         <DoorAccessCard
                              title={doorDevices[0]?.label || "Cửa ra vào"}
                              doorDevices={doorDevices}
                              doorOnlineMap={boardOnlineMap}
                              pending={{
                                   openingDoor: pending.openingDoor,
                                   changingDoorPin: pending.changingDoorPin,
                              }}
                              actions={{
                                   openDoor: actions.openDoor,
                                   changeDoorPassword: actions.changeDoorPassword,
                                   requestRenameDoor: (door) => {
                                        openRenameModal({
                                             boardId: door.espId,
                                             deviceId: door.id,
                                             currentName: door.label,
                                        })
                                   },
                              }}
                         />
                    </View>
               }

               {normalDevices.length > 0 ? (
                    <View style={styles.grid}>
                         {normalDevices.map((device) => (
                              <View key={device.id} style={styles.item}>
                                   <DeviceCard
                                        iconName={mapTopicIcon(device.payload.topic)}
                                        title={device.title}
                                        subtitle={device.subtitle}
                                        isOn={device.isOn}
                                        disabled={device.disabled}
                                        loading={Boolean(deviceLoadingMap[device.id])}
                                        topic={device.payload.topic}
                                        onLongPress={() =>
                                             openRenameModal({
                                                  boardId: device.boardId,
                                                  deviceId: device.apiDeviceId,
                                                  currentName: device.title,
                                             })
                                        }
                                        onToggle={(isOn) => {
                                             void handleToggle(device, isOn)
                                        }}
                                   />
                              </View>
                         ))}
                    </View>
               ) : null}

               <ApartmentModal
                    visible={isRenameModalVisible}
                    title="Đổi tên thiết bị"
                    onClose={closeRenameModal}
                    onAfterClose={clearRenameModalState}
                    disableBackdropClose={Boolean(pending.renaming)}
                    footer={
                         <>
                              <Pressable
                                   onPress={closeRenameModal}
                                   style={[styles.renameBtn, styles.renameCancelBtn]}
                                   disabled={pending.renaming}
                              >
                                   <Text style={styles.renameCancelText}>Hủy</Text>
                              </Pressable>
                              <Pressable
                                   onPress={() => void submitRename()}
                                   style={[styles.renameBtn, styles.renameSubmitBtn]}
                                   disabled={pending.renaming}
                              >
                                   {pending.renaming ? (
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