import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  decodeSocialCookie,
  SOCIAL_SESSION_COOKIE,
  type SocialSession,
} from "@/lib/auth/external-social"

export async function GET() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SOCIAL_SESSION_COOKIE)?.value
  if (!raw) {
    return NextResponse.json({ session: null })
  }

  const session = decodeSocialCookie<SocialSession>(raw)
  if (!session) {
    return NextResponse.json({ session: null })
  }

  return NextResponse.json({ session })
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SOCIAL_SESSION_COOKIE)
  return response
}
