// Chemin : lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchir la session et récupérer l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🔍 [Middleware] Début de la requête")
  console.log("📂 Chemin demandé:", pathname)
  console.log("👤 Utilisateur connecté:", user?.email || "Aucun")

  // Récupérer le rôle de l'utilisateur si connecté
  let role = null
  if (user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (error) {
      console.error("❌ [Middleware] Erreur récupération rôle:", error.message)
    } else {
      role = profile?.role
      console.log("🎭 [Middleware] Rôle trouvé:", role)
    }
  } else {
    console.log("🎭 [Middleware] Pas d'utilisateur connecté")
  }

  // === PROTECTION DES ROUTES ===

  // 1. Routes Dashboard client (authentification requise)
  if (pathname.startsWith("/dashboard")) {
    console.log("🛡️ [Middleware] Route DASHBOARD détectée")
    if (!user) {
      console.log("⛔ [Middleware] Pas d'utilisateur → redirection vers login")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", "/dashboard")
      return NextResponse.redirect(url)
    }
    console.log("✅ [Middleware] Accès dashboard autorisé")
  }

  // 2. Routes Admin (admin et gestionnaire uniquement)
  if (pathname.startsWith("/admin")) {
    console.log("🛡️ [Middleware] Route ADMIN détectée")
    
    // Pas connecté du tout
    if (!user) {
      console.log("⛔ [Middleware] Pas d'utilisateur → redirection vers login")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", "/admin")
      return NextResponse.redirect(url)
    }
    
    // Vérifier le rôle
    console.log(`🔍 [Middleware] Vérification du rôle: ${role} (admin/gestionnaire requis)`)
    
    if (role !== "admin" && role !== "gestionnaire") {
      console.log(`⛔ [Middleware] Accès ADMIN refusé pour rôle "${role}" → redirection vers dashboard`)
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    
    console.log("✅ [Middleware] Accès ADMIN autorisé")
  }

  // 3. Routes Conseiller (conseiller, admin, gestionnaire)
  if (pathname.startsWith("/conseiller")) {
    console.log("🛡️ [Middleware] Route CONSEILLER détectée")
    
    if (!user) {
      console.log("⛔ [Middleware] Pas d'utilisateur → redirection vers login")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", "/conseiller")
      return NextResponse.redirect(url)
    }
    
    console.log(`🔍 [Middleware] Vérification du rôle: ${role} (conseiller/admin/gestionnaire requis)`)
    
    if (role !== "conseiller" && role !== "admin" && role !== "gestionnaire") {
      console.log(`⛔ [Middleware] Accès CONSEILLER refusé pour rôle "${role}" → redirection vers dashboard`)
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    
    console.log("✅ [Middleware] Accès CONSEILLER autorisé")
  }

  // 4. Routes API admin protégées
  if (pathname.startsWith("/api/admin")) {
    console.log("🛡️ [Middleware] Route API ADMIN détectée")
    
    if (!user) {
      console.log("⛔ [Middleware] API: Pas d'utilisateur → 401")
      return new NextResponse(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }
    
    if (role !== "admin" && role !== "gestionnaire") {
      console.log(`⛔ [Middleware] API: Rôle "${role}" non autorisé → 403`)
      return new NextResponse(
        JSON.stringify({ error: "Permission refusée" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }
    
    console.log("✅ [Middleware] API ADMIN autorisée")
  }

  console.log("✅ [Middleware] Fin de la requête - Passage au composant")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  
  return supabaseResponse
}