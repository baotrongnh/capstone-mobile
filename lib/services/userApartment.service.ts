import {
    GetUserApartmentByIdRes,
    ListMyUserApartmentsRes,
    UpdateMyHousePasswordParams,
    UpdateMyHousePasswordRes,
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

export const updateMyHousePassword = async ({ id, payload }: UpdateMyHousePasswordParams): Promise<UpdateMyHousePasswordRes> => {
    const res = await apiClient.patch(`${endpoints.userApartments}/${id}/house-password`, payload)
    return res.data
}
