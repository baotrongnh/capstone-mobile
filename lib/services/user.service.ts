import { UserDetail } from "../../types/user";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const userService = {
    getProfile: async (): Promise<UserDetail> => {
        const { data } = await apiClient.get(`${endpoints.users}/profile`)
        return data.data
    }
}