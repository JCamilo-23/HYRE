export interface NovaMessage {
  id: string
  role: "user" | "assistant"
  content: string
}
