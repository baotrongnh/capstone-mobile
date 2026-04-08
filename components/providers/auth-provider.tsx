'use client'

import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const hydrate = useAuthStore((s) => s.hydrate)

    useEffect(() => {
        hydrate()
    }, [hydrate])

    return <>{children}</>
}
