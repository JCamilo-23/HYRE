import type { UserRole } from "./types"
import { getAuthCallbackUrl as buildAuthCallbackUrl, getSafeAppOrigin } from "@/lib/supabase/app-origin"

export type HyreUserType = "candidate" | "company"
export type OAuthProvider = "google" | "apple" | "linkedin_oidc"

export function mapUserTypeToRole(userType: HyreUserType | null): UserRole {
  return userType === "company" ? "recruiter" : "candidate"
}

export function mapRoleToUserType(role: UserRole | null | undefined): HyreUserType {
  return role === "recruiter" ? "company" : "candidate"
}

export function getAuthCallbackUrl(role: UserRole, next = "/app", origin?: string): string {
  return buildAuthCallbackUrl(role, next, origin)
}

export { getSafeAppOrigin }
