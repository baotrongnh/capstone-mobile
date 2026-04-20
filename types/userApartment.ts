import type { paths } from './api'

export type ListMyUserApartmentsRes = paths['/api/v1/user-apartments/my']['get']['responses']['200']['content']['application/json']
export type ListMyUserApartmentsPayload = NonNullable<ListMyUserApartmentsRes['data']>
export type UserApartmentItem = ListMyUserApartmentsPayload[number]
export type UserApartmentData = NonNullable<UserApartmentItem['apartment']>

export type GetUserApartmentByIdPathParams = paths['/api/v1/user-apartments/{id}']['get']['parameters']['path']
export type GetUserApartmentByIdRes = paths['/api/v1/user-apartments/{id}']['get']['responses']['200']['content']['application/json']
export type UserApartmentDetailItem = NonNullable<GetUserApartmentByIdRes['data']>

export type GetIotBoardsQuery = paths['/api/v1/iot/boards']['get']['parameters']['query']
export type GetIotBoardsRes = paths['/api/v1/iot/boards']['get']['responses']['200']['content']['application/json']
export type IotBoardListItem = NonNullable<NonNullable<GetIotBoardsRes['data']>[number]>
export type IotBoardDeviceItem = IotBoardListItem['devices'][number]

export type IotDeviceTopic = 'alarm' | 'light' | 'curtain' | 'door' | 'unknown'

export type ApartmentIotDeviceDisplayItem = {
    key: string
    boardId: string
    deviceId: number
    deviceName: string
    state: IotBoardDeviceItem['state']
    topic: IotBoardDeviceItem['topic']
    normalizedTopic: IotDeviceTopic
}

type UpdateDoorPinPayload = paths['/api/v1/iot/doors/{boardId}/{deviceId}/pin']['patch']['requestBody']['content']['application/json']
export type UpdateDoorPinRes = paths['/api/v1/iot/doors/{boardId}/{deviceId}/pin']['patch']['responses']['200']['content']['application/json']

export type DoorPinTarget = {
    boardId: string
    deviceId: number
}

export type UpdateDoorPinParams = {
    boardId: string
    deviceId: number
    payload: UpdateDoorPinPayload
}

export type UserApartmentApiError = {
    message?: string | string[]
}