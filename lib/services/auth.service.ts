import { LoginDTO, LoginPayload, LogoutDTO, LogoutRes, RefreshTokenDto, RefreshTokenRes } from "@/types/auth";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const authServices = {
    login: async (payload: LoginDTO): Promise<LoginPayload> => {
        const { data } = await apiClient.post(`${endpoints.auth}/login`, payload)
        return data.data
    },
    logout: async (refreshToken: LogoutDTO): Promise<LogoutRes> => {
        const { data } = await apiClient.post(`${endpoints.auth}/logout`, refreshToken)
        return data
    },
    refresh: async (tokenData: RefreshTokenDto): Promise<RefreshTokenRes> => {
        const { data } = await apiClient.post(`${endpoints.auth}/refresh`, tokenData)
        return data.data
    },
}