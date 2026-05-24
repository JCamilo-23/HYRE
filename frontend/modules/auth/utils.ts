import type { UserRole } from "./types"

export type HyreUserType = "candidate" | "company"
export type OAuthProvider = "google" | "apple" | "linkedin_oidc"

export function mapUserTypeToRole(userType: HyreUserType | null): UserRole {
  return userType === "company" ? "recruiter" : "candidate"
}

export function mapRoleToUserType(role: UserRole | null | undefined): HyreUserType {
  return role === "recruiter" ? "company" : "candidate"
}

export function getAuthCallbackUrl(role: UserRole, next = "/app", origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
  const params = new URLSearchParams({ role, next })
  return `${base}/auth/callback?${params.toString()}`
}
