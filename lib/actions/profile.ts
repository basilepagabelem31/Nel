// Chemin : lib/actions/profile.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const phone = formData.get("phone") as string

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: first_name || null,
      last_name: last_name || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Erreur mise à jour profil:", error)
    redirect("/conseiller/profile?error=update_failed")
  }

  revalidatePath("/conseiller/profile")
  redirect("/conseiller/profile?success=true")
}