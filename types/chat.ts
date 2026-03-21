export type ChatMode = 'support' | 'ai' | null
export type ChatSender = 'user' | 'support'

export const CHAT_MODE_STORAGE_KEY = 'chat_mode'

export interface ChatMessage {
     id: string | number
     content: string
     images?: string[]
     apartmentId?: string
     sender: ChatSender
     timestamp: Date
}

export interface ChatApartmentRef {
     id: string | number
     buildingName?: string | null
     apartmentNumber: string
}
