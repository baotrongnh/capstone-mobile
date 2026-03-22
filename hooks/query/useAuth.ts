import { authServices } from "@/lib/services/auth.service"
import { userService } from "@/lib/services/user.service"
import { useAuthStore } from "@/stores/auth.store"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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