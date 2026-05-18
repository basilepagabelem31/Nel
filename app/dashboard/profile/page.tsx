import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile-form"

export const metadata = {
  title: "Mon profil",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gerez vos informations personnelles</p>
      </div>

      <ProfileForm 
        profile={{
          id: user.id,
          email: user.email || null,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          phone: profile?.phone || null,
          avatar_url: profile?.avatar_url || null,
        }} 
      />
    </div>
  )
}
