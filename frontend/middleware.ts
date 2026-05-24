import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/empezar", "/app", "/login", "/register", "/pricing", "/onboarding", "/auth", "/interview", "/recruiter"];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return NextResponse.next();
  }

  try {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isPublic = PUBLIC_ROUTES.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );

    if (!session && !isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  } catch (error) {
    console.error("[middleware] Supabase auth check failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
