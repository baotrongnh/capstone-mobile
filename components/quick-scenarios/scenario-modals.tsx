import ApartmentModal from "@/components/apartment/apartment-modal"
import type { QuickScenarioChoice, QuickScenarioTopic } from "@/types/quickScenario"
import React from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"

export type ScenarioModalDevice = {
     boardId: string
     deviceApiId: string
     deviceId: number
     deviceName: string
     topic: QuickScenarioTopic
}

export type ScenarioModalDeviceGroup = {
     topic: QuickScenarioTopic
     items: ScenarioModalDevice[]
}

type ScenarioMap = Record<string, QuickScenarioChoice | undefined>

const TOPIC_LABEL: Record<QuickScenarioTopic, string> = {
     light: "Đèn",
     curtain: "Rèm",
}

const OPTIONS_BY_TOPIC: Record<QuickScenarioTopic, QuickScenarioChoice[]> = {
     light: ["on", "off"],
     curtain: ["open", "close"],
}

function optionLabel(option: QuickScenarioChoice) {
     if (option === "on") return "Bật"
     if (option === "off") return "Tắt"
     if (option === "open") return "Mở"
     return "Đóng"
}

function DeviceOptionsList({
     groups,
     valueByDevice,
     onChooseOption,
}: {
     groups: ScenarioModalDeviceGroup[]
     valueByDevice: ScenarioMap
     onChooseOption: (deviceApiId: string, value: QuickScenarioChoice) => void
}) {
     return (
          <ScrollView style={styles.list} nestedScrollEnabled>
               {groups.map((group) => (
                    <View key={group.topic} style={styles.topicSection}>
                         <Text style={styles.topicTitle}>{TOPIC_LABEL[group.topic]} ({group.items.length})</Text>

                         {group.items.map((device) => {
                              const selected = valueByDevice[device.deviceApiId]

                              return (
                                   <View key={device.deviceApiId} style={styles.deviceCard}>
                                        <Text style={styles.deviceName} numberOfLines={1}>{device.deviceName}</Text>

                                        <View style={styles.optionRow}>
                                             {OPTIONS_BY_TOPIC[group.topic].map((choice) => {
                                                  const active = selected === choice

                                                  return (
                                                       <Pressable
                                                            key={choice}
                                                            style={[styles.optionChip, active && styles.optionChipActive]}
                                                            onPress={() => onChooseOption(device.deviceApiId, choice)}
                                                       >
                                                            <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                                                                 {optionLabel(choice)}
                                                            </Text>
                                                       </Pressable>
                                                  )
                                             })}
                                        </View>
                                   </View>
                              )
                         })}
                    </View>
               ))}
          </ScrollView>
     )
}

export function QuickScenarioCreateModal({
     visible,
     isSaving,
     canSubmit,
     name,
     onChangeName,
     onClose,
     onSubmit,
     loadingDevices,
     totalDevices,
     devicesByTopic,
     createByDevice,
     onChooseOption,
}: {
     visible: boolean
     isSaving: boolean
     canSubmit: boolean
     name: string
     onChangeName: (value: string) => void
     onClose: () => void
     onSubmit: () => void
     loadingDevices: boolean
     totalDevices: number
     devicesByTopic: ScenarioModalDeviceGroup[]
     createByDevice: ScenarioMap
     onChooseOption: (deviceApiId: string, value: QuickScenarioChoice) => void
}) {
     return (
          <ApartmentModal
               visible={visible}
               title="Tạo kịch bản"
               description="Thiết bị Đèn/Rèm được chọn theo từng thiết bị"
               onClose={onClose}
               liftOnKeyboard
               disableBackdropClose={isSaving}
               footer={
                    <>
                         <Pressable style={styles.modalGhostBtn} onPress={onClose} disabled={isSaving}>
                              <Text style={styles.modalGhostBtnText}>Hủy</Text>
                         </Pressable>

                         <Pressable
                              style={[styles.modalPrimaryBtn, !canSubmit && styles.modalPrimaryBtnDisabled]}
                              onPress={onSubmit}
                              disabled={!canSubmit}
                         >
                              <Text style={styles.modalPrimaryBtnText}>{isSaving ? "Đang tạo..." : "Tạo"}</Text>
                         </Pressable>
                    </>
               }
          >
               <TextInput
                    value={name}
                    onChangeText={onChangeName}
                    placeholder="Ví dụ: Về nhà buổi tối"
                    placeholderTextColor="#9ca3af"
                    style={styles.modalInput}
                    maxLength={40}
                    autoFocus
               />

               {loadingDevices ? (
                    <View style={styles.inlineMessage}>
                         <ActivityIndicator size="small" color="#2563eb" />
                         <Text style={styles.inlineMessageText}>Đang tải danh sách thiết bị...</Text>
                    </View>
               ) : totalDevices === 0 ? (
                    <Text style={styles.inlineMessageText}>Không có thiết bị Đèn/Rèm để tạo kịch bản.</Text>
               ) : (
                    <>
                         <Text style={styles.inlineMessageText}>Đã tải {totalDevices} thiết bị Đèn/Rèm.</Text>
                         <DeviceOptionsList
                              groups={devicesByTopic}
                              valueByDevice={createByDevice}
                              onChooseOption={onChooseOption}
                         />
                    </>
               )}
          </ApartmentModal>
     )
}

export function QuickScenarioEditModal({
     visible,
     isSaving,
     canSave,
     name,
     onChangeName,
     onClose,
     onAfterClose,
     onSave,
     onDelete,
     hiddenItemsCount,
     devicesByTopic,
     editByDevice,
     onChooseOption,
}: {
     visible: boolean
     isSaving: boolean
     canSave: boolean
     name: string
     onChangeName: (value: string) => void
     onClose: () => void
     onAfterClose: () => void
     onSave: () => void
     onDelete: () => void
     hiddenItemsCount: number
     devicesByTopic: ScenarioModalDeviceGroup[]
     editByDevice: ScenarioMap
     onChooseOption: (deviceApiId: string, value: QuickScenarioChoice) => void
}) {
     return (
          <ApartmentModal
               visible={visible}
               title="Chỉnh sửa kịch bản"
               description="Nhấn lại lựa chọn đang chọn để bỏ thiết bị"
               onClose={onClose}
               onAfterClose={onAfterClose}
               liftOnKeyboard
               disableBackdropClose={isSaving}
               position="bottom"
               footer={
                    <>
                         <Pressable style={styles.modalDangerBtn} onPress={onDelete} disabled={isSaving}>
                              <Text style={styles.modalDangerBtnText}>Xóa</Text>
                         </Pressable>

                         <Pressable
                              style={[styles.modalPrimaryBtn, !canSave && styles.modalPrimaryBtnDisabled]}
                              onPress={onSave}
                              disabled={!canSave}
                         >
                              <Text style={styles.modalPrimaryBtnText}>{isSaving ? "Đang lưu..." : "Lưu"}</Text>
                         </Pressable>
                    </>
               }
          >
               <TextInput
                    value={name}
                    onChangeText={onChangeName}
                    placeholder="Tên kịch bản"
                    placeholderTextColor="#9ca3af"
                    style={styles.modalInput}
                    maxLength={40}
               />

               {hiddenItemsCount > 0 ? (
                    <Text style={styles.inlineMessageText}>Đang giữ {hiddenItemsCount} thiết bị cũ không còn trong căn hộ hiện tại.</Text>
               ) : null}

               <DeviceOptionsList
                    groups={devicesByTopic}
                    valueByDevice={editByDevice}
                    onChooseOption={onChooseOption}
               />
          </ApartmentModal>
     )
}

const styles = StyleSheet.create({
     modalInput: {
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 10,
          paddingHorizontal: 11,
          paddingVertical: 10,
          fontSize: 14,
          color: "#111827",
          backgroundColor: "#ffffff",
     },
     modalGhostBtn: {
          minWidth: 80,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          backgroundColor: "#e2e8f0",
          paddingHorizontal: 12,
          paddingVertical: 10,
     },
     modalGhostBtnText: {
          fontSize: 13,
          color: "#334155",
          fontWeight: "700",
     },
     modalPrimaryBtn: {
          minWidth: 90,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          backgroundColor: "#2563eb",
          paddingHorizontal: 12,
          paddingVertical: 10,
     },
     modalPrimaryBtnDisabled: {
          opacity: 0.45,
     },
     modalPrimaryBtnText: {
          fontSize: 13,
          color: "#ffffff",
          fontWeight: "700",
     },
     modalDangerBtn: {
          minWidth: 80,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          backgroundColor: "#fef2f2",
          borderWidth: 1,
          borderColor: "#fecaca",
          paddingHorizontal: 12,
          paddingVertical: 10,
     },
     modalDangerBtnText: {
          fontSize: 13,
          color: "#dc2626",
          fontWeight: "700",
     },
     inlineMessage: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
     },
     inlineMessageText: {
          fontSize: 12,
          color: "#64748b",
          fontWeight: "500",
     },
     list: {
          maxHeight: 320,
          marginTop: 4,
     },
     topicSection: {
          gap: 8,
          marginTop: 4,
     },
     topicTitle: {
          fontSize: 12,
          color: "#1d4ed8",
          fontWeight: "700",
     },
     deviceCard: {
          borderWidth: 1,
          borderColor: "#dbe5f3",
          borderRadius: 11,
          backgroundColor: "#f8fafc",
          padding: 8,
          gap: 6,
     },
     deviceName: {
          fontSize: 13,
          color: "#0f172a",
          fontWeight: "600",
     },
     optionRow: {
          flexDirection: "row",
          gap: 6,
     },
     optionChip: {
          borderWidth: 1,
          borderColor: "#dbe5f3",
          borderRadius: 8,
          backgroundColor: "#ffffff",
          paddingHorizontal: 10,
          paddingVertical: 6,
     },
     optionChipActive: {
          borderColor: "#1d4ed8",
          backgroundColor: "#1d4ed8",
     },
     optionChipText: {
          fontSize: 12,
          color: "#374151",
          fontWeight: "700",
     },
     optionChipTextActive: {
          color: "#ffffff",
     },
})
