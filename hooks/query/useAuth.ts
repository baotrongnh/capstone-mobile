import { authServices } from "@/lib/services/auth.service"
import { userService } from "@/lib/services/user.service"
import { useAuthStore } from "@/stores/auth.store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import Constants from "expo-constants"
WebBrowser.maybeCompleteAuthSession()

const toErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }

    return fallback
}

const getOAuthRedirectUri = (): string => {
    if (Constants.executionEnvironment === 'storeClient') {
        return Linking.createURL('/login')
    }

    return Linking.createURL('/login', { scheme: 'mobile' })
}


export const useLogin = () => {
    const setTokens = useAuthStore((s) => s.setTokens)
    const setAuth = useAuthStore((s) => s.setAuth)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authServices.login,
        onSuccess: async (data) => {
            queryClient.clear()

            const tokens = data?.tokens
            if (!tokens) return
            await setTokens(tokens)

            try {
                const user = await queryClient.fetchQuery({
                    queryKey: ['user', 'profile'],
                    queryFn: () => userService.getProfile()
                })

                await setAuth(user, tokens)
                console.log('success', user)
            } catch (error) {
                console.log('profileError')
                console.log(`Fetch profile failed: ${toErrorMessage(error, 'Unknown error')}`)
            }
        },
        onError: (error) => {
            console.log('loginError')
            console.log(`Login failed: ${toErrorMessage(error, 'Unknown error')}`)
        }
    })
}

export const useGoogleLogin = () => {
    const setTokens = useAuthStore((s) => s.setTokens)
    const setAuth = useAuthStore((s) => s.setAuth)
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const login = async (): Promise<boolean> => {
        setLoading(true)
        try {
            const fallbackRedirectUri = getOAuthRedirectUri()
            const redirectUri =
                process.env.EXPO_PUBLIC_SUPABASE_RETURN_URL
                || process.env.EXPO_PUBLIC_APP_URL
                || fallbackRedirectUri

            const url = await authServices.getSupabaseUrl(redirectUri)
            const authUrl = url
            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

            if (result.type !== 'success') {
                return false
            }

            const accessToken = result.url?.split("access_token=")[1]?.split("&")[0]

            if (!accessToken) throw new Error("No access token")


            const loginRes = await authServices.googleLogin(accessToken)
            console.log("loginRes:", loginRes)

            const tokens = loginRes?.tokens
            if (!tokens) {
                throw new Error('Google login response is invalid')
            }

            await setTokens(tokens)
            const user = await queryClient.fetchQuery({
                queryKey: ['user', 'profile'],
                queryFn: () => userService.getProfile()
            })

            await setAuth(user, tokens)
            console.log('success', user)

            return true

        } catch (error) {
            console.log("Something went wrong during Google login")
            console.log(`Google login failed: ${toErrorMessage(error, 'Unknown error')}`)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { login, loading }
}

export const useLogout = (onSuccess?: () => void) => {
    const logoutStore = useAuthStore((s) => s.logout)
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => {
            const refreshToken = localStorage.getItem('refreshToken') ?? ''
            return authServices.logout({ refreshToken })
        },
        onSuccess: () => {
            logoutStore()
            queryClient.clear()
            console.log('Logout successful!')
            onSuccess?.()
        },
        onError: () => {
            logoutStore()
            queryClient.clear()
        }
    })
}