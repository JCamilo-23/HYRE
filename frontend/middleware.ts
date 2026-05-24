import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/pricing"];

const isDevPlaceholderSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ?? false;

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  if (isDevPlaceholderSupabase) {
    return response;
  }

  const { data: { session } } = await supabase.auth.getSession();

  const isPublic = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
