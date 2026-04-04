import { authServices } from "@/lib/services/auth.service"
import { userService } from "@/lib/services/user.service"
import { useAuthStore } from "@/stores/auth.store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import Constants from "expo-constants"
WebBrowser.maybeCompleteAuthSession()

const withRedirectTo = (authUrl: string, redirectUri: string): string => {
    const [base, hash] = authUrl.split('#')
    const [path, query = ''] = base.split('?')
    const params = new URLSearchParams(query)
    params.set('redirect_to', redirectUri)

    const nextUrl = `${path}?${params.toString()}`
    return hash ? `${nextUrl}#${hash}` : nextUrl
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
                console.error('Fetch profile failed', error)
            }
        },
        onError: (error) => {
            console.log('loginError')
            console.error("Login failed", error)
        }
    })
}

export const useGoogleLogin = () => {
    const setTokens = useAuthStore((s) => s.setTokens)
    const setAuth = useAuthStore((s) => s.setAuth)
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const login = async () => {
        setLoading(true)
        try {
            const redirectUri = getOAuthRedirectUri()
            console.log(redirectUri)
            const url = await authServices.getSupabaseUrl()

            console.log('URL', url)
            const authUrl = withRedirectTo(url, redirectUri)
            console.log(authUrl)

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
            console.log('Resul: ', result)

            if (result.type !== 'success') {
                setLoading(false)
                return
            }

            const accessToken = result.url?.split("access_token=")[1]?.split("&")[0]

            if (!accessToken) throw new Error("No access token")


            const loginRes = await authServices.googleLogin(accessToken)
            console.log("loginRes:", loginRes)

            const tokens = loginRes?.data?.tokens
            if (tokens) {
                await setTokens(tokens)
                const user = await queryClient.fetchQuery({
                    queryKey: ['user', 'profile'],
                    queryFn: () => userService.getProfile()
                })

                await setAuth(user, tokens)
                console.log('success', user)
            }

        } catch (error) {
            console.log("Somethings went wrong!")
            console.error('Google login failed', error)
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