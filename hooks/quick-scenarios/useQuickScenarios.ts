import { useDeviceIot, useIotBoards } from "@/hooks/query/useDevices"
import { useUserApartment } from "@/hooks/query/useUserApartment"
import { QUICK_SCENARIO_MAX, quickScenarioStorage } from "@/stores/quick-scenario.storage"
import { storage } from "@/stores/storage"
import type { QuickScenarioChoice, QuickScenarioDeviceSetting, QuickScenarioPreset, QuickScenarioTopic } from "@/types/quickScenario"
import type { UserApartmentItem } from "@/types/userApartment"
import { toControlAction } from "@/utils/format"
import { useIsFocused } from "@react-navigation/native"
import { useEffect, useMemo, useState } from "react"
import { Alert } from "react-native"

const APARTMENT_STORAGE_KEY = "selectedApartmentId"
const TOPIC_ORDER: QuickScenarioTopic[] = ["light", "curtain"]
const EMPTY_APARTMENTS: UserApartmentItem[] = []

type ScenarioMap = Record<string, QuickScenarioChoice | undefined>

export type ScenarioDevice = {
     boardId: string
     deviceApiId: string
     deviceId: number
     deviceName: string
     topic: QuickScenarioTopic
}

export type ScenarioDeviceGroup = {
     topic: QuickScenarioTopic
     items: ScenarioDevice[]
}

const getApartmentId = (item: UserApartmentItem) => String(item.apartmentId)
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function normalizeTopic(topic?: string | null): QuickScenarioTopic | null {
     if (!topic) return null

     const value = topic.toLowerCase().trim()
     if (value === "light" || value.includes("light")) return "light"
     if (value === "curtain" || value.includes("curtain")) return "curtain"

     return null
}

function toScenarioMap(items: QuickScenarioDeviceSetting[]): ScenarioMap {
     const next: ScenarioMap = {}

     for (const item of items) {
          next[item.deviceApiId] = item.scenario
     }

     return next
}

function buildItemsFromMap(devices: ScenarioDevice[], map: ScenarioMap): QuickScenarioDeviceSetting[] {
     const next: QuickScenarioDeviceSetting[] = []

     for (const device of devices) {
          const scenario = map[device.deviceApiId]
          if (!scenario) continue

          next.push({
               boardId: device.boardId,
               deviceApiId: device.deviceApiId,
               deviceId: device.deviceId,
               deviceName: device.deviceName,
               topic: device.topic,
               scenario,
          })
     }

     return next
}

function getDefaultChoice(topic: QuickScenarioTopic): QuickScenarioChoice {
     if (topic === "light") return "on"
     return "open"
}

function buildDefaultMap(devices: ScenarioDevice[], current?: ScenarioMap): ScenarioMap {
     const next: ScenarioMap = {}

     for (const device of devices) {
          next[device.deviceApiId] = current?.[device.deviceApiId] ?? getDefaultChoice(device.topic)
     }

     return next
}

function itemSignature(items: QuickScenarioDeviceSetting[]) {
     return items
          .map((item) => `${item.deviceApiId}:${item.scenario}`)
          .sort()
          .join("|")
}

function isSameScenarioMap(a: ScenarioMap, b: ScenarioMap) {
     const aKeys = Object.keys(a)
     const bKeys = Object.keys(b)

     if (aKeys.length !== bKeys.length) return false

     for (const key of aKeys) {
          if (a[key] !== b[key]) return false
     }

     return true
}

export function summarizeScenario(scenario: QuickScenarioPreset) {
     let lightCount = 0
     let curtainCount = 0

     for (const item of scenario.items) {
          if (item.topic === "light") lightCount += 1
          if (item.topic === "curtain") curtainCount += 1
     }

     return { lightCount, curtainCount, totalDevices: scenario.items.length }
}

export function useQuickScenarios() {
     const isFocused = useIsFocused()
     const { mutateAsync: toggleDeviceMutation } = useDeviceIot()

     const [selectedApartmentId, setSelectedApartmentId] = useState("")
     const [isHydratedStorage, setIsHydratedStorage] = useState(false)

     const [scenarios, setScenarios] = useState<QuickScenarioPreset[]>([])
     const [savedAt, setSavedAt] = useState("")
     const [runningScenarioId, setRunningScenarioId] = useState("")

     const [isCreateOpen, setIsCreateOpen] = useState(false)
     const [isCreateSaving, setIsCreateSaving] = useState(false)
     const [createName, setCreateName] = useState("")
     const [createByDevice, setCreateByDevice] = useState<ScenarioMap>({})

     const [isEditOpen, setIsEditOpen] = useState(false)
     const [isEditSaving, setIsEditSaving] = useState(false)
     const [editScenarioId, setEditScenarioId] = useState("")
     const [editName, setEditName] = useState("")
     const [editByDevice, setEditByDevice] = useState<ScenarioMap>({})

     const { data: apartmentData, isLoading: isApartmentLoading } = useUserApartment()
     const { data: boardsData, isLoading: isBoardsLoading, refetch: refetchBoards } = useIotBoards(selectedApartmentId || undefined)

     const myApartments = (apartmentData?.data as UserApartmentItem[] | undefined) ?? EMPTY_APARTMENTS

     const scenarioDevices = useMemo(() => {
          const next: ScenarioDevice[] = []

          for (const board of boardsData?.data ?? []) {
               for (const device of board.devices ?? []) {
                    const topic = normalizeTopic(device.topic)
                    if (!topic || device.deviceId == null) continue

                    next.push({
                         boardId: board.id,
                         deviceApiId: device.id,
                         deviceId: device.deviceId,
                         deviceName: device.deviceName || `Thiết bị ${device.deviceId}`,
                         topic,
                    })
               }
          }

          return next
     }, [boardsData?.data])

     const grouped: Record<QuickScenarioTopic, ScenarioDevice[]> = {
          light: [],
          curtain: [],
     }

     for (const device of scenarioDevices) {
          grouped[device.topic].push(device)
     }

     const devicesByTopic: ScenarioDeviceGroup[] = TOPIC_ORDER
          .map((topic) => ({ topic, items: grouped[topic] }))
          .filter((group) => group.items.length > 0)

     const editingScenario = scenarios.find((item) => item.id === editScenarioId) || null

     const availableDeviceIdSet = new Set<string>()
     for (const device of scenarioDevices) {
          availableDeviceIdSet.add(device.deviceApiId)
     }

     const hiddenItems = editingScenario
          ? editingScenario.items.filter((item) => !availableDeviceIdSet.has(item.deviceApiId))
          : []

     const draftCreateItems = buildItemsFromMap(scenarioDevices, createByDevice)
     const draftEditItems = [...buildItemsFromMap(scenarioDevices, editByDevice), ...hiddenItems]

     const canCreate =
          Boolean(selectedApartmentId) &&
          Boolean(createName.trim()) &&
          scenarios.length < QUICK_SCENARIO_MAX &&
          scenarioDevices.length > 0 &&
          draftCreateItems.length === scenarioDevices.length &&
          !isBoardsLoading &&
          !isCreateSaving

     const hasEditChanges = editingScenario
          ? editName.trim() !== editingScenario.name || itemSignature(draftEditItems) !== itemSignature(editingScenario.items)
          : false

     const canSaveEdit = Boolean(editingScenario) && Boolean(editName.trim()) && hasEditChanges && !isEditSaving

     async function syncSelectedApartmentFromStorage() {
          const savedApartmentId = await storage.getItem(APARTMENT_STORAGE_KEY)
          setSelectedApartmentId(savedApartmentId ?? "")
          setIsHydratedStorage(true)
     }

     function onSelectApartment(apartmentId: string) {
          setSelectedApartmentId(apartmentId)

          if (apartmentId) {
               void storage.setItem(APARTMENT_STORAGE_KEY, apartmentId)
               return
          }

          void storage.removeItem(APARTMENT_STORAGE_KEY)
     }

     async function loadScenarios(targetApartmentId: string) {
          if (!targetApartmentId) {
               setScenarios([])
               setSavedAt("")
               return
          }

          const payload = await quickScenarioStorage.get(targetApartmentId)
          setScenarios(payload.scenarios || [])
          setSavedAt(payload.savedAt || "")
     }

     async function saveScenarios(nextScenarios: QuickScenarioPreset[]) {
          if (!selectedApartmentId) return

          await quickScenarioStorage.save(selectedApartmentId, nextScenarios)
          setScenarios(nextScenarios)
          setSavedAt(new Date().toISOString())
     }

     async function runScenario(scenario: QuickScenarioPreset) {
          if (runningScenarioId) return

          if (!scenario.items.length) {
               Alert.alert("Kịch bản trống", "Kịch bản này chưa có thiết bị để chạy")
               return
          }

          setRunningScenarioId(scenario.id)

          try {
               const results = await Promise.allSettled(
                    scenario.items.map((item) =>
                         toggleDeviceMutation({
                              espId: item.boardId,
                              deviceId: item.deviceId,
                              topic: item.topic,
                              action: toControlAction(item.scenario),
                         }),
                    ),
               )

               console.log(results)

               // let successCount = 0
               // for (const result of results) {
               //      if (result.status === "fulfilled" && result.value?.data?.success) {
               //           successCount += 1
               //      }
               // }

               // Alert.alert("Đã chạy kịch bản", `Kết quả: ${successCount}/${scenario.items.length} thiết bị thành công.`)
          } finally {
               setRunningScenarioId("")
          }
     }

     function openCreateModal() {
          setCreateName("")
          setCreateByDevice(buildDefaultMap(scenarioDevices))
          setIsCreateOpen(true)

          if (selectedApartmentId) {
               void refetchBoards()
          }
     }

     function closeCreateModal() {
          if (isCreateSaving) return
          setIsCreateOpen(false)
     }

     function onChooseCreateOption(deviceApiId: string, value: QuickScenarioChoice) {
          setCreateByDevice((prev) => ({ ...prev, [deviceApiId]: value }))
     }

     async function submitCreateScenario() {
          if (!canCreate) return

          setIsCreateSaving(true)
          try {
               const newScenario: QuickScenarioPreset = {
                    id: makeId(),
                    name: createName.trim(),
                    items: draftCreateItems,
                    updatedAt: new Date().toISOString(),
               }

               await saveScenarios([...scenarios, newScenario])
               setIsCreateOpen(false)
          } finally {
               setIsCreateSaving(false)
          }
     }

     function openEditModal(scenario: QuickScenarioPreset) {
          setEditScenarioId(scenario.id)
          setEditName(scenario.name)
          setEditByDevice(toScenarioMap(scenario.items))
          setIsEditOpen(true)

          if (selectedApartmentId) {
               void refetchBoards()
          }
     }

     function closeEditModal() {
          if (isEditSaving) return
          setIsEditOpen(false)
     }

     function clearEditModalState() {
          setEditScenarioId("")
          setEditName("")
          setEditByDevice({})
     }

     function onChooseEditOption(deviceApiId: string, value: QuickScenarioChoice) {
          setEditByDevice((prev) => {
               const current = prev[deviceApiId]
               return { ...prev, [deviceApiId]: current === value ? undefined : value }
          })
     }

     async function submitEditScenario() {
          if (!editingScenario || !canSaveEdit) return

          setIsEditSaving(true)
          try {
               const nextScenarios = scenarios.map((item) => {
                    if (item.id !== editingScenario.id) return item

                    return {
                         ...item,
                         name: editName.trim(),
                         items: draftEditItems,
                         updatedAt: new Date().toISOString(),
                    }
               })

               await saveScenarios(nextScenarios)
               setIsEditOpen(false)
          } finally {
               setIsEditSaving(false)
          }
     }

     async function deleteScenario(scenarioId: string) {
          const nextScenarios = scenarios.filter((item) => item.id !== scenarioId)
          await saveScenarios(nextScenarios)
     }

     function confirmDeleteEditingScenario() {
          if (!editingScenario) return

          Alert.alert("Xóa kịch bản", `Bạn có chắc muốn xóa \"${editingScenario.name}\" không?`, [
               { text: "Hủy", style: "cancel" },
               {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                         setIsEditOpen(false)
                         void deleteScenario(editingScenario.id)
                    },
               },
          ])
     }

     useEffect(() => {
          void syncSelectedApartmentFromStorage()
     }, [])

     useEffect(() => {
          if (!isFocused) return
          void syncSelectedApartmentFromStorage()
     }, [isFocused])

     useEffect(() => {
          if (!isCreateOpen) return

          setCreateByDevice((prev) => {
               const next = buildDefaultMap(scenarioDevices, prev)
               return isSameScenarioMap(prev, next) ? prev : next
          })
     }, [isCreateOpen, scenarioDevices])

     useEffect(() => {
          if (!isHydratedStorage || isApartmentLoading) return

          if (!myApartments.length) {
               if (selectedApartmentId) {
                    setSelectedApartmentId("")
                    void storage.removeItem(APARTMENT_STORAGE_KEY)
               }
               return
          }

          const isValid = myApartments.some((item) => getApartmentId(item) === selectedApartmentId)
          if (isValid) return

          const nextApartmentId = getApartmentId(myApartments[0])
          setSelectedApartmentId(nextApartmentId)
          void storage.setItem(APARTMENT_STORAGE_KEY, nextApartmentId)
     }, [isApartmentLoading, isHydratedStorage, myApartments, selectedApartmentId])

     useEffect(() => {
          if (!isHydratedStorage || !isFocused) return
          void loadScenarios(selectedApartmentId)
     }, [isHydratedStorage, selectedApartmentId, isFocused])

     return {
          selectedApartmentId,
          isHydratedStorage,
          isApartmentLoading,
          isBoardsLoading,
          myApartments,
          scenarios,
          savedAt,
          runningScenarioId,
          scenarioDevices,
          devicesByTopic,
          hiddenItems,
          isCreateOpen,
          isCreateSaving,
          createName,
          createByDevice,
          canCreate,
          isEditOpen,
          isEditSaving,
          editName,
          editByDevice,
          canSaveEdit,
          onSelectApartment,
          runScenario,
          openCreateModal,
          closeCreateModal,
          setCreateName,
          onChooseCreateOption,
          submitCreateScenario,
          openEditModal,
          closeEditModal,
          clearEditModalState,
          setEditName,
          onChooseEditOption,
          submitEditScenario,
          confirmDeleteEditingScenario,
     }
}
