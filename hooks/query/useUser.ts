import { userService } from "@/lib/services/user.service"
import { useAuthStore } from "@/stores/auth.store"
import { UpdateUserDto } from "@/types/user"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useUserProfile = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const isHydrated = useAuthStore((s) => s.isHydrated)

    return useQuery({
        queryKey: ["user", "profile"],
        queryFn: () => userService.getProfile(),
        enabled: isHydrated && isAuthenticated,
    })
}

export const useUpdateUser = (id: string) => {
    const queryClient = useQueryClient()
    const tokens = useAuthStore((s) => s.tokens)
    const setAuth = useAuthStore((s) => s.setAuth)

    const syncAuthUser = async () => {
        if (!tokens) {
            return
        }

        const user = await queryClient.fetchQuery({
            queryKey: ["user", "profile"],
            queryFn: () => userService.getProfile(),
        })

        await setAuth(user, tokens)
    }

    return useMutation({
        mutationFn: (payload: UpdateUserDto) => userService.update(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
            await syncAuthUser()
        },
    })
}

export const useUpdateUserAvatar = (id: string) => {
    const queryClient = useQueryClient()
    const tokens = useAuthStore((s) => s.tokens)
    const setAuth = useAuthStore((s) => s.setAuth)

    const syncAuthUser = async () => {
        if (!tokens) {
            return
        }

        const user = await queryClient.fetchQuery({
            queryKey: ["user", "profile"],
            queryFn: () => userService.getProfile(),
        })

        await setAuth(user, tokens)
    }

    return useMutation({
        mutationFn: (profileImageUrl: string) => userService.updateAvatar(id, profileImageUrl),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
            await syncAuthUser()
        },
    })
}
