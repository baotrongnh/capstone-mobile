import { ApartmentIotDeviceDisplayItem, DoorPinTarget, IotBoardListItem, IotDeviceTopic } from "@/types/userApartment"

export const normalizeIotTopic = (topic: string | null | undefined): IotDeviceTopic => {
    const normalized = (topic ?? "").trim().toLowerCase()

    if (normalized === "alarm" || normalized === "light" || normalized === "curtain" || normalized === "door") {
        return normalized
    }

    return "unknown"
}

const isDoorDevice = (device: IotBoardListItem["devices"][number]) => {
    const topic = normalizeIotTopic(device.topic)
    const name = (device.deviceName ?? "").toLowerCase()

    return topic === "door" || name.includes("door") || name.includes("cua")
}

export const buildApartmentIotDevices = (
    boards: IotBoardListItem[] | null | undefined,
    apartmentId?: string,
): ApartmentIotDeviceDisplayItem[] => {
    if (!boards?.length) {
        return []
    }

    const normalizedApartmentId = apartmentId?.trim()

    const apartmentBoards = normalizedApartmentId
        ? boards.filter((board) => board.apartment?.id === normalizedApartmentId)
        : boards

    const targetBoards = apartmentBoards.length > 0 ? apartmentBoards : boards

    return targetBoards.flatMap((board) =>
        board.devices.map((device) => ({
            key: `${board.id}-${device.id}`,
            boardId: board.id,
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            state: device.state,
            topic: device.topic,
            normalizedTopic: normalizeIotTopic(device.topic),
        })),
    )
}

export const resolveDoorPinTargetFromBoards = (
    boards: IotBoardListItem[] | null | undefined,
    apartmentId?: string,
): DoorPinTarget | null => {
    if (!boards?.length) {
        return null
    }

    const normalizedApartmentId = apartmentId?.trim()

    const apartmentBoards = normalizedApartmentId
        ? boards.filter((board) => board.apartment?.id === normalizedApartmentId)
        : boards

    const targetBoards = apartmentBoards.length > 0 ? apartmentBoards : boards

    for (const board of targetBoards) {
        const doorDevice = board.devices.find(isDoorDevice)

        if (!doorDevice) {
            continue
        }

        return {
            boardId: board.id,
            deviceId: doorDevice.deviceId,
        }
    }

    return null
}