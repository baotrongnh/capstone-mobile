import { AuthState, AuthTokens } from "@/types/auth";
import { create } from "zustand";
import { UserDetail } from "../types/user";
import { storage } from "./storage";

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isHydrated: false,

    setAuth: async (user: UserDetail, tokens: AuthTokens) => {
        await storage.setItem("accessToken", tokens.accessToken)
        await storage.setItem("refreshToken", tokens.refreshToken)
        await storage.setItem("user", JSON.stringify(user))

        set({ user, tokens, isAuthenticated: true })
    },
    setTokens: async (tokens: AuthTokens) => {
        await storage.setItem("accessToken", tokens.accessToken)
        await storage.setItem("refreshToken", tokens.refreshToken)
    },
    logout: async () => {
        await storage.removeItem("accessToken")
        await storage.removeItem("refreshToken")
        await storage.removeItem("user")

        set({ user: null, tokens: null, isAuthenticated: false })
    },
    hydrate: async () => {
        const accessToken = await storage.getItem("accessToken");
        const refreshToken = await storage.getItem("refreshToken");
        const userStr = await storage.getItem("user");

        if (accessToken && refreshToken && userStr) {
            try {
                const user = JSON.parse(userStr)
                set({
                    user,
                    tokens: { accessToken, refreshToken },
                    isAuthenticated: true,
                    isHydrated: true,
                })
            } catch {
                set({ isHydrated: true })
            }
        } else {
            set({ isHydrated: true })
        }
    }
}))