// Chemin : app/conseiller/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConseillerHeader } from "@/components/conseiller/conseiller-header"
import { ConseillerSidebar } from "@/components/conseiller/conseiller-sidebar"

export const metadata = {
  title: "Espace Conseiller | Nella@House",
}

export default async function ConseillerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Vérifier le rôle (conseiller, admin ou gestionnaire)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "client"

  if (role !== "conseiller" && role !== "admin" && role !== "gestionnaire") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <ConseillerHeader user={user} profile={profile} />
      <div className="flex">
        <ConseillerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}