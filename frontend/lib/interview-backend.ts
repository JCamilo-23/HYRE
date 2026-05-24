/**
 * Server-side URL for the FastAPI interview backend.
 */
export function getInterviewBackendUrl(): string {
  return (
    process.env.INTERVIEW_BACKEND_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  )
}

/** WebSocket base URL for the browser (direct to FastAPI). */
export function getInterviewWsBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")

  if (fromEnv) {
    return fromEnv.replace(/^http/, "ws").replace(/^https/, "wss")
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    return `${protocol}//${window.location.hostname}:8000`
  }

  return "ws://127.0.0.1:8000"
}
