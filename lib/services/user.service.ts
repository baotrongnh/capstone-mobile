import { UpdateUserDto, UpdateUserResponse, UserDetail } from "../../types/user";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const userService = {
    getProfile: async (): Promise<UserDetail> => {
        const { data } = await apiClient.get(`${endpoints.users}/profile`)
        return data.data
    },

    update: async (id: string, payload: UpdateUserDto): Promise<UpdateUserResponse> => {
        const { data } = await apiClient.patch(`${endpoints.users}/${id}`, payload)
        return data.data
    },

    updateAvatar: async (id: string, profileImageUrl: string): Promise<UpdateUserResponse> => {
        const { data } = await apiClient.patch(`${endpoints.users}/${id}`, { profileImageUrl })
        return data.data
    },
}