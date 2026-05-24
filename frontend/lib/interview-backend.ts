/**
 * Server-side URL for the FastAPI interview backend.
 * Used by Next.js API route proxies (avoids browser CORS / connection refused noise).
 */
export function getInterviewBackendUrl(): string {
  return (
    process.env.INTERVIEW_BACKEND_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  )
}

export function getInterviewWsBaseUrl(): string {
  const http =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  return http.replace(/^http/, "ws").replace(/^https/, "wss")
}
