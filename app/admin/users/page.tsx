// Chemin : app/admin/users/page.tsx
import { createClient } from "@/lib/supabase/server"
import { UsersClient } from "./users-client"

export const metadata = {
  title: "Gestion des Utilisateurs",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return <UsersClient initialUsers={users || []} />
}