import type { paths } from './api'

export type ListMyUserApartmentsRes = paths['/api/v1/user-apartments/my']['get']['responses']['200']['content']['application/json']
export type ListMyUserApartmentsPayload = NonNullable<ListMyUserApartmentsRes['data']>
export type UserApartmentItem = ListMyUserApartmentsPayload[number]
export type UserApartmentData = NonNullable<UserApartmentItem['apartment']>

export type UpdateMyHousePasswordPathParams = paths['/api/v1/user-apartments/{id}/house-password']['patch']['parameters']['path']
export type UpdateMyHousePasswordPayload = paths['/api/v1/user-apartments/{id}/house-password']['patch']['requestBody']['content']['application/json']
export type UpdateMyHousePasswordRes = paths['/api/v1/user-apartments/{id}/house-password']['patch']['responses']['200']['content']['application/json']

export type UpdateMyHousePasswordParams = {
    id: string
    payload: UpdateMyHousePasswordPayload
}