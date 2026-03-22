import axios from "axios"
import { endpoints } from "./endpoints"
import { storage } from "@/stores/storage"

export const apiClient = axios.create({
     baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
     withCredentials: true
})

apiClient.interceptors.request.use(async (config) => {
     const accessToken = await storage.getItem("accessToken")
     if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
     }
     return config
})

apiClient.interceptors.response.use(undefined, async (error) => {
     const originalRequest = error.config

     // Skip refresh logic for auth endpoints (login, register, etc.) to avoid
     // premature page reloads that swallow error toasts and network responses.
     const isAuthEndpoint = originalRequest?.url?.includes('/auth/')

     if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true

          const refreshToken = await storage.getItem("refreshToken")
          if (!refreshToken) {
               console.error("Unauthorized: missing refresh token")
               return Promise.reject(error)
          }

          try {
               const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoints.auth}/refresh`,
                    { refreshToken }
               )
               //debug (nhbt):
               console.log('REFRESH NEW TOKEN: ', data)
               const newTokens = data.data.tokens
               await storage.setItem("accessToken", newTokens.accessToken)
               await storage.setItem("refreshToken", newTokens.refreshToken)
               originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
               return apiClient(originalRequest)
          } catch (refreshError) {
               console.error("Refresh token failed", refreshError)
               return Promise.reject(refreshError)
          }
     }

     return Promise.reject(error)
})
