import { create } from "zustand"
import { buildGreeting } from "@/modules/nova/chat-service"
import type { NovaMessage } from "@/modules/nova/types"

interface NovaState {
  isOpen: boolean
  isVisible: boolean
  hasBottomNav: boolean
  userName: string
  messages: NovaMessage[]
  sessionId: string | null
  isTyping: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setVisible: (visible: boolean) => void
  setHasBottomNav: (hasBottomNav: boolean) => void
  setUserName: (name: string) => void
  setMessages: (messages: NovaMessage[]) => void
  appendMessage: (message: Omit<NovaMessage, "id">) => void
  setSessionId: (sessionId: string | null) => void
  setIsTyping: (isTyping: boolean) => void
  ensureGreeting: () => void
}

export const useNovaStore = create<NovaState>((set, get) => ({
  isOpen: false,
  isVisible: false,
  hasBottomNav: false,
  userName: "",
  messages: [],
  sessionId: null,
  isTyping: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setVisible: (isVisible) => set({ isVisible }),
  setHasBottomNav: (hasBottomNav) => set({ hasBottomNav }),

  setUserName: (userName) => {
    set({ userName })
    get().ensureGreeting()
  },

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((s) => ({
      messages: [...s.messages, { ...message, id: crypto.randomUUID() }],
    })),

  setSessionId: (sessionId) => set({ sessionId }),
  setIsTyping: (isTyping) => set({ isTyping }),

  ensureGreeting: () => {
    const { messages, userName } = get()
    if (messages.length > 0) return
    const firstName = userName.split(" ")[0] || "amigo"
    set({
      messages: [
        {
          id: "greeting",
          role: "assistant",
          content: buildGreeting(firstName),
        },
      ],
    })
  },
}))
