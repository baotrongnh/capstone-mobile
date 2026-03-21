import axios from "axios"
import { endpoints } from "./endpoints"

export const apiClient = axios.create({
     baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
     withCredentials: true
})

apiClient.interceptors.request.use((config) => {
     //token here
     const accessToken = ''
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

          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
               const redirectUrl = `/?openAuthModal=true&redirect=${encodeURIComponent(window.location.pathname)}`
               localStorage.clear()
               window.location.href = redirectUrl
               return Promise.reject(error)
          }

          try {
               const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoints.auth}/refresh`,
                    { refreshToken }
               )
               //debug (nhbt):
               console.log('REFRESH NEW TOKEN: ', data)
               const newTokens = data.data.tokens
               localStorage.setItem('accessToken', newTokens.accessToken)
               localStorage.setItem('refreshToken', newTokens.refreshToken)
               originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
               return apiClient(originalRequest)
          } catch {
               localStorage.clear()
               window.location.href = '/'
               return Promise.reject(error)
          }
     }

     return Promise.reject(error)
})
