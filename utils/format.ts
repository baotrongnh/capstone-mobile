import { QuickScenarioChoice } from "@/types/quickScenario"

export const formatUpdatedAt = (value: string) => {
     if (!value) return ""

     const date = new Date(value)
     if (Number.isNaN(date.getTime())) return ""

     return date.toLocaleString("vi-VN")
}

export const toControlAction = (choice: QuickScenarioChoice): "ON" | "OFF" => {
     if (choice === "on" || choice === "open") return "ON"
     return "OFF"
}