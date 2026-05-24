import { NextResponse } from "next/server"
import {
  buildExternalSocialLoginUrl,
  buildSocialReturnUrl,
  encodeSocialCookie,
  isOAuthProvider,
  POPUP_SOCIAL_PROVIDERS,
  SOCIAL_PENDING_COOKIE,
  type SocialPendingAuth,
} from "@/lib/auth/external-social"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"
import type { UserRole } from "@/modules/auth/types"

function parseRole(value: string | null): UserRole {
  return value === "recruiter" ? "recruiter" : "candidate"
}

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: providerParam } = await context.params
  if (!isOAuthProvider(providerParam)) {
    return NextResponse.redirect(
      new URL("/app?auth=error&reason=Proveedor+de+acceso+invalido", request.url),
    )
  }

  const url = new URL(request.url)
  const role = parseRole(url.searchParams.get("role"))
  const next = url.searchParams.get("next") ?? "/app"
  const origin = getSafeAppOrigin(url.origin)

  const pending: SocialPendingAuth = {
    provider: providerParam,
    role,
    next: next.startsWith("/") ? next : "/app",
    startedAt: new Date().toISOString(),
  }

  if (POPUP_SOCIAL_PROVIDERS.includes(providerParam)) {
    const waitUrl = new URL(`${origin}/auth/social/wait`)
    waitUrl.searchParams.set("provider", providerParam)
    waitUrl.searchParams.set("role", role)
    waitUrl.searchParams.set("next", pending.next)

    const response = NextResponse.redirect(waitUrl)
    response.cookies.set(SOCIAL_PENDING_COOKIE, encodeSocialCookie(pending), {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: 60 * 15,
    })
    return response
  }

  const returnUrl = buildSocialReturnUrl(providerParam, origin)
  const externalUrl = buildExternalSocialLoginUrl(providerParam, returnUrl)

  const response = NextResponse.redirect(externalUrl)
  response.cookies.set(SOCIAL_PENDING_COOKIE, encodeSocialCookie(pending), {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 60 * 15,
  })
  return response
}
