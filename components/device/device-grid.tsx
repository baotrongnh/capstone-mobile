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
     boardName: string
     isBoardLocked: boolean
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
     onViewDoorHistory?: () => void
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

type LockedBoardInfo = {
     id: string
     name: string
}

type DeviceGroups = {
     normalDevices: NormalDevice[]
     doorDevices: DoorDeviceOption[]
     lockedBoards: LockedBoardInfo[]
     boardLockedMap: Record<string, boolean>
}

const LOCKED_BOARD_SUPPORT_MESSAGE =
     "Vui lòng liên hệ nhân viên hỗ trợ để biết thêm chi tiết và được hỗ trợ."

const isInactiveStatus = (status?: string | null) => (status ?? "").toLowerCase() === "inactive"

const buildDeviceGroups = (
     boards: IotBoardItem[],
     boardOnlineMap: Record<string, boolean>
): DeviceGroups => {
     const normalDevices: NormalDevice[] = []
     const doorDevices: DoorDeviceOption[] = []
     const lockedBoards: LockedBoardInfo[] = []
     const boardLockedMap: Record<string, boolean> = {}

     for (const board of boards) {
          const isBoardLocked = isInactiveStatus(board.status)
          boardLockedMap[board.id] = isBoardLocked

          if (isBoardLocked) {
               lockedBoards.push({
                    id: board.id,
                    name: board.name || board.id,
               })
          }

          const isBoardOffline = boardOnlineMap[board.id] === false

          for (const device of board.devices) {
               if (isInactiveStatus(device.status)) continue

               const topic = toControlTopic(device.topic)
               if (!topic || device.deviceId == null) continue

               if (topic === "door") {
                    doorDevices.push({
                         id: device.id,
                         espId: board.id,
                         deviceId: device.deviceId,
                         label: device.deviceName || board.name || `Cửa ${device.deviceId}`,
                         boardName: board.name || board.id,
                         isBoardLocked,
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
                    disabled: isBoardOffline || isBoardLocked,
                    payload: {
                         deviceId: device.deviceId,
                         action: "OFF",
                         espId: board.id,
                         topic,
                    },
               })
          }
     }

     return { normalDevices, doorDevices, lockedBoards, boardLockedMap }
}

export default function DeviceGrid({
     boards,
     boardOnlineMap = {},
     actions,
     pending = {},
     onViewDoorHistory,
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

     const { normalDevices, doorDevices, lockedBoards, boardLockedMap } = useMemo(
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
               {lockedBoards.length > 0 ? (
                    <View style={styles.lockedBoardsWrap}>
                         {lockedBoards.map((board) => (
                              <View key={board.id} style={styles.lockedBoardCard}>
                                   <View style={styles.lockedBoardTopRow}>
                                        <MaterialCommunityIcons name="lock-alert-outline" size={18} color="#b45309" />
                                        <Text style={styles.lockedBoardTitle}>Mạch {board.name} đang bị khóa</Text>
                                   </View>
                                   <Text style={styles.lockedBoardDescription}>{LOCKED_BOARD_SUPPORT_MESSAGE}</Text>
                              </View>
                         ))}
                    </View>
               ) : null}

               {doorDevices.length > 0 &&
                    <View style={styles.sectionBlock}>
                         <DoorAccessCard
                              title={doorDevices[0]?.label || "Cửa ra vào"}
                              doorDevices={doorDevices}
                              doorOnlineMap={boardOnlineMap}
                              doorLockedMap={boardLockedMap}
                              pending={{
                                   openingDoor: pending.openingDoor,
                                   changingDoorPin: pending.changingDoorPin,
                              }}
                              actions={{
                                   openDoor: actions.openDoor,
                                   changeDoorPassword: actions.changeDoorPassword,
                                   viewDoorHistory: onViewDoorHistory,
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
                                        onLongPress={device.disabled ? undefined : () =>
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
     lockedBoardsWrap: {
          gap: 8,
     },
     lockedBoardCard: {
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#fde68a",
          backgroundColor: "#fffbeb",
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 4,
     },
     lockedBoardTopRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
     },
     lockedBoardTitle: {
          fontSize: 13,
          fontWeight: "700",
          color: "#92400e",
     },
     lockedBoardDescription: {
          fontSize: 12,
          lineHeight: 18,
          color: "#a16207",
     },
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