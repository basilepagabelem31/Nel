// Chemin : app/dashboard/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile avec le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, role")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "client"

  // 🔥 REDIRECTION AUTOMATIQUE SELON LE RÔLE
  if (role === "admin" || role === "gestionnaire") {
    redirect("/admin")
  }
  
  // Optionnel : rediriger les conseillers vers leur espace
  if (role === "conseiller") {
    redirect("/conseiller")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader user={user} profile={profile} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}