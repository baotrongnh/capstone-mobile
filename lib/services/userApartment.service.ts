import {
    GetIotBoardsQuery,
    GetIotBoardsRes,
    GetUserApartmentByIdRes,
    ListMyUserApartmentsRes,
    UpdateDoorPinParams,
    UpdateDoorPinRes,
} from '@/types/userApartment'
import { apiClient } from '../apis/client'
import { endpoints } from '../apis/endpoints'

export const getMyUserApartments = async (): Promise<ListMyUserApartmentsRes> => {
    const res = await apiClient.get(`${endpoints.userApartments}/my`)
    return res.data
}

export const getUserApartmentById = async (id: string): Promise<GetUserApartmentByIdRes> => {
    const res = await apiClient.get(`${endpoints.userApartments}/${id}`)
    return res.data
}

export const getIotBoards = async (query?: GetIotBoardsQuery): Promise<GetIotBoardsRes> => {
    const res = await apiClient.get(`${endpoints.iot}/boards`, { params: query })
    return res.data
}

export const updateDoorPin = async ({ boardId, deviceId, payload }: UpdateDoorPinParams): Promise<UpdateDoorPinRes> => {
    const res = await apiClient.patch(`${endpoints.iot}/doors/${boardId}/${deviceId}/pin`, payload)
    return res.data
}
