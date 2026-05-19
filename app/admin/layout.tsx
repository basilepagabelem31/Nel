// Chemin : app/admin/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // ✅ CORRECTION : Sélectionner tous les champs nécessaires
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")  // ← Ajoutez first_name et last_name
    .eq("id", user.id)
    .single()

  const role = profile?.role || "client"

  // Autoriser admin et gestionnaire seulement
  if (role !== "admin" && role !== "gestionnaire") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-sidebar">
      <AdminSidebar userRole={role} />
      <div className="lg:ml-64">
        <AdminHeader user={user} profile={profile} />
        <main className="p-6 bg-background min-h-[calc(100vh-65px)] rounded-tl-3xl">
          {children}
        </main>
      </div>
    </div>
  )
}