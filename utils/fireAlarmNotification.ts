import { iotServices } from "@/lib/services/iot.service"
import type { IoTControlRequestBody } from "@/lib/services/iot.service"

type FireAlarmPayloadSource = Record<string, unknown> | null | undefined

type FireAlarmControlPayload = {
     apartmentId?: string
     espId: string
     deviceId: number
     topic: IoTControlRequestBody["topic"]
     action: IoTControlRequestBody["action"]
}

const VALID_TOPICS: IoTControlRequestBody["topic"][] = ["light", "alarm", "door", "curtain", "electric", "water"]
const VALID_ACTIONS: IoTControlRequestBody["action"][] = ["ON", "OFF"]

const FIRE_ALARM_CONTROL_SCREEN = "fire_alarm_control"

const toText = (value: unknown): string | undefined => {
     if (typeof value !== "string" && typeof value !== "number") {
          return undefined
     }

     const text = String(value).trim()
     return text.length ? text : undefined
}

const parseActionUrl = (actionUrl: string | undefined): Partial<FireAlarmControlPayload> => {
     if (!actionUrl) {
          return {}
     }

     const queryText = actionUrl.includes("?") ? actionUrl.split("?")[1] : actionUrl
     const params = new URLSearchParams(queryText)

     return {
          apartmentId: toText(params.get("apartmentId")),
          espId: toText(params.get("espId")),
          deviceId: toDeviceId(toText(params.get("deviceId"))),
          topic: toTopic(toText(params.get("deviceTopic")) ?? toText(params.get("topic"))),
          action: toAction(toText(params.get("action"))),
     }
}

const toDeviceId = (value: unknown): number | undefined => {
     const text = toText(value)
     if (!text) {
          return undefined
     }

     const deviceId = Number(text)
     return Number.isInteger(deviceId) ? deviceId : undefined
}

const toTopic = (value: unknown): IoTControlRequestBody["topic"] | undefined => {
     const text = toText(value)
     return VALID_TOPICS.includes(text as IoTControlRequestBody["topic"])
          ? text as IoTControlRequestBody["topic"]
          : undefined
}

const toAction = (value: unknown): IoTControlRequestBody["action"] | undefined => {
     const text = toText(value)?.toUpperCase()
     return VALID_ACTIONS.includes(text as IoTControlRequestBody["action"])
          ? text as IoTControlRequestBody["action"]
          : undefined
}

export const getFireAlarmControlPayload = (
     source: FireAlarmPayloadSource,
): FireAlarmControlPayload | null => {
     if (!source) {
          return null
     }

     const actionUrl = toText(source.actionUrl)
     const screen = toText(source.screen)
     const isFireAlarmControl = screen === FIRE_ALARM_CONTROL_SCREEN || actionUrl?.includes("/iot/fire-alarm")

     if (!isFireAlarmControl) {
          return null
     }

     const actionUrlPayload = parseActionUrl(actionUrl)
     const payload = {
          apartmentId: toText(source.apartmentId) ?? toText(source.relatedEntityId) ?? actionUrlPayload.apartmentId,
          espId: toText(source.espId) ?? actionUrlPayload.espId,
          deviceId: toDeviceId(source.deviceId) ?? actionUrlPayload.deviceId,
          topic: toTopic(source.deviceTopic) ?? toTopic(source.topic) ?? actionUrlPayload.topic,
          action: toAction(source.action) ?? actionUrlPayload.action,
     }

     if (!payload.espId || !payload.deviceId || !payload.topic || !payload.action) {
          return null
     }

     return payload as FireAlarmControlPayload
}

export const handleFireAlarmControlNotification = async (
     source: FireAlarmPayloadSource,
): Promise<boolean> => {
     const payload = getFireAlarmControlPayload(source)

     if (!payload) {
          return false
     }

     await iotServices.deviceControl({
          espId: payload.espId,
          deviceId: payload.deviceId,
          topic: payload.topic,
          action: payload.action,
     })

     return true
}

export const getFireAlarmControlRouteParams = (source: FireAlarmPayloadSource) => {
     const payload = getFireAlarmControlPayload(source)

     if (!payload) {
          return null
     }

     return {
          ...(payload.apartmentId ? { apartmentId: payload.apartmentId } : {}),
          espId: payload.espId,
          deviceId: String(payload.deviceId),
          deviceTopic: payload.topic,
          action: payload.action,
     }
}

export const getFireAlarmControlHref = (source: FireAlarmPayloadSource): string | null => {
     const params = getFireAlarmControlRouteParams(source)

     if (!params) {
          return null
     }

     const query = new URLSearchParams(params).toString()
     return `/fire-alarm-control?${query}`
}
