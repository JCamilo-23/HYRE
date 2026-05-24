export function getInterviewBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"
}

export function getInterviewWsBaseUrl(): string {
  const http = getInterviewBackendUrl()
  return http.replace(/^http/, "ws")
}
