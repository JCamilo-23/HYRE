import type { UserRole } from "./types"

export type HyreUserType = "candidate" | "company"

export type OAuthProvider = "google" | "apple" | "linkedin_oidc"

export function mapUserTypeToRole(userType: HyreUserType | null): UserRole {
  if (userType === "company") return "recruiter"
  return "candidate"
}

export function mapRoleToUserType(role: UserRole | null | undefined): HyreUserType {
  if (role === "recruiter") return "company"
  return "candidate"
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

export function displayNameFromUserMetadata(metadata: Record<string, unknown> | undefined): string {
  if (!metadata) return "Usuario"
  const fullName = metadata.full_name ?? metadata.name
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim()
  return "Usuario"
}
