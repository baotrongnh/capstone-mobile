import { io, Socket } from 'socket.io-client'
import { ChatMessage } from '../../types/chat'

interface ServerToClientEvents {
     noArg: () => void;
     basicEmit: (a: number, b: string, c: Buffer) => void;
     withAck: (d: string, callback: (e: number) => void) => void;
     'chat:new_message': (payload: ChatMessage) => void
}

interface ClientToServerEvents {
     'chat:send_message': (payload: ChatMessage) => void
     'chat:join_conversation': (payload: { conversationId: string }) => void
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
     autoConnect: false,
})

export const setSocketAuthToken = (token?: string | null) => {
     socket.auth = token ? { token } : {}
}

