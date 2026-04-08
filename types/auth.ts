import { paths } from "./api";
import { UserDetail } from "./user";

export type LoginDTO = paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json']
export type LoginRes = paths['/api/v1/auth/login']['post']['responses']['200']['content']['application/json']
export type LoginPayload = NonNullable<LoginRes['data']>

export type LogoutDTO = paths['/api/v1/auth/logout']['post']['requestBody']['content']['application/json']
export type LogoutRes = paths['/api/v1/auth/logout']['post']['responses']['200']['content']

export type RefreshTokenDto = paths['/api/v1/auth/refresh']['post']['requestBody']['content']['application/json']
export type RefreshTokenRes = paths['/api/v1/auth/refresh']['post']['responses']['200']['content']['application/json']
export type AuthTokens = NonNullable<RefreshTokenRes['data']>

export type AuthState = {
    user: UserDetail | null
    tokens: AuthTokens | null
    isAuthenticated: boolean
    isHydrated: boolean
    setAuth: (user: UserDetail, tokens: AuthTokens) => Promise<void>
    setTokens: (tokens: AuthTokens) => Promise<void>
    logout: () => Promise<void>
    hydrate: () => Promise<void>
}