import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // First handle i18n routing
  const response = intlMiddleware(request)
  
  // Then update Supabase session
  return await updateSession(request, response)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - Static files (favicon, images, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
