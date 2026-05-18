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

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "gestionnaire"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-sidebar">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminHeader user={user} />
        <main className="p-6 bg-background min-h-[calc(100vh-65px)] rounded-tl-3xl">
          {children}
        </main>
      </div>
    </div>
  )
}
