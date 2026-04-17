import { storage } from "@/stores/storage"
import type {
     QuickScenarioApartmentData,
     QuickScenarioDeviceSetting,
     QuickScenarioPreset,
} from "@/types/quickScenario"

export const QUICK_SCENARIO_MAX = 5

const keyByApartment = (apartmentId: string) => `quick-scenarios:${apartmentId}`

const limitScenarios = (scenarios: QuickScenarioPreset[]) => scenarios.slice(0, QUICK_SCENARIO_MAX)

const createEmpty = (apartmentId: string): QuickScenarioApartmentData => ({
     apartmentId,
     savedAt: "",
     scenarios: [],
})

const createLegacyPreset = (items: QuickScenarioDeviceSetting[]): QuickScenarioPreset => ({
     id: "legacy-default",
     name: "Mặc định",
     items,
     updatedAt: new Date().toISOString(),
})

export const quickScenarioStorage = {
     async get(apartmentId: string): Promise<QuickScenarioApartmentData> {
          if (!apartmentId) return createEmpty("")

          const raw = await storage.getItem(keyByApartment(apartmentId))
          if (!raw) return createEmpty(apartmentId)

          try {
               const parsed = JSON.parse(raw) as {
                    savedAt?: string
                    scenarios?: QuickScenarioPreset[]
                    items?: QuickScenarioDeviceSetting[]
               }

               if (Array.isArray(parsed.scenarios)) {
                    return {
                         apartmentId,
                         savedAt: parsed.savedAt || "",
                         scenarios: limitScenarios(parsed.scenarios),
                    }
               }

               if (Array.isArray(parsed.items)) {
                    return {
                         apartmentId,
                         savedAt: parsed.savedAt || "",
                         scenarios: parsed.items.length ? limitScenarios([createLegacyPreset(parsed.items)]) : [],
                    }
               }

               return createEmpty(apartmentId)
          } catch {
               return createEmpty(apartmentId)
          }
     },

     async save(apartmentId: string, scenarios: QuickScenarioPreset[]) {
          if (!apartmentId) return

          const nextScenarios = limitScenarios(scenarios)

          const payload: QuickScenarioApartmentData = {
               apartmentId,
               savedAt: new Date().toISOString(),
               scenarios: nextScenarios,
          }

          await storage.setItem(keyByApartment(apartmentId), JSON.stringify(payload))
     },
}
