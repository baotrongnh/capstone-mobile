export type QuickScenarioTopic = "light" | "curtain"
export type QuickScenarioChoice = "on" | "off" | "open" | "close"

export type QuickScenarioDeviceSetting = {
     boardId: string
     deviceApiId: string
     deviceId: number
     deviceName: string
     topic: QuickScenarioTopic
     scenario: QuickScenarioChoice
}

export type QuickScenarioPreset = {
     id: string
     name: string
     items: QuickScenarioDeviceSetting[]
     updatedAt: string
}

export type QuickScenarioApartmentData = {
     apartmentId: string
     savedAt: string
     scenarios: QuickScenarioPreset[]
}
