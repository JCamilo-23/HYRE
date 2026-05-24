import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  createSocialSession,
  decodeSocialCookie,
  encodeSocialCookie,
  isOAuthProvider,
  SOCIAL_PENDING_COOKIE,
  SOCIAL_SESSION_COOKIE,
  type SocialPendingAuth,
} from "@/lib/auth/external-social"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"
import type { UserRole } from "@/modules/auth/types"

function parseRole(value: string | null, fallback: UserRole): UserRole {
  return value === "recruiter" ? "recruiter" : value === "candidate" ? "candidate" : fallback
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const providerParam = url.searchParams.get("provider")
  const origin = getSafeAppOrigin(url.origin)

  if (!providerParam || !isOAuthProvider(providerParam)) {
    return NextResponse.redirect(
      `${origin}/app?auth=error&reason=${encodeURIComponent("Retorno de acceso social invalido")}`,
    )
  }

  const cookieStore = await cookies()
  const pendingRaw = cookieStore.get(SOCIAL_PENDING_COOKIE)?.value
  const pending = pendingRaw
    ? decodeSocialCookie<SocialPendingAuth>(pendingRaw)
    : null

  const role = parseRole(url.searchParams.get("role"), pending?.role ?? "candidate")
  const nextPath =
    url.searchParams.get("next") ?? pending?.next ?? "/app"
  const safeNext = nextPath.startsWith("/") ? nextPath : "/app"

  const session = createSocialSession(providerParam, role)

  const response = NextResponse.redirect(`${origin}${safeNext}?auth=success&social=1`)
  response.cookies.set(SOCIAL_SESSION_COOKIE, encodeSocialCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  response.cookies.delete(SOCIAL_PENDING_COOKIE)
  return response
}
