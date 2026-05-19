// Chemin : lib/actions/settings.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getSettings() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
  
  const settings: Record<string, string> = {}
  data?.forEach(item => {
    settings[item.key] = item.value
  })
  
  return settings
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  
  // Vérifier que l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Non autorisé" }
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    
  if (profile?.role !== "admin") {
    return { error: "Permission refusée" }
  }
  
  // Récupérer tous les champs du formulaire
  const keys = [
    "site_name", "contact_email", "contact_phone", "contact_address",
    "site_description", "shipping_free_threshold", "shipping_standard_fee",
    "stripe_mode", "facebook_url", "instagram_url", "twitter_url",
    "tiktok_url", "maintenance_mode"
  ]
  
  for (const key of keys) {
    const value = formData.get(key) as string
    if (value !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString(), 
          updated_by: user.id 
        }, {
          onConflict: 'key'
        })
      
      if (error) {
        console.error(`Erreur pour ${key}:`, error)
      }
    }
  }
  
  // 🔥 Forcer la revalidation de plusieurs chemins
  revalidatePath("/admin/settings")
  revalidatePath("/")
  
  return { success: true }
}