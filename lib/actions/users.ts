// Chemin : lib/actions/users.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createUser(formData: {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
}) {
  const supabase = await createClient()

  // Vérifier que l'utilisateur actuel est admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    return { error: "Non autorisé" }
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single()

  if (currentProfile?.role !== "admin") {
    return { error: "Permission refusée. Seul un administrateur peut créer des utilisateurs." }
  }

  // 1. Vérifier si l'email existe déjà
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", formData.email)
    .maybeSingle()

  if (existingProfile) {
    return { error: "Un utilisateur avec cet email existe déjà" }
  }

  // 2. Créer l'utilisateur dans auth
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("Erreur création auth:", error)
    return { error: error.msg || "Erreur lors de la création de l'utilisateur" }
  }

  const newUser = await response.json()

  if (!newUser.id) {
    return { error: "Erreur: ID utilisateur non reçu" }
  }

  // 3. ✅ CORRECTION : Mettre à jour le profil existant au lieu de l'insérer
  //    (Supabase crée automatiquement un profil vide lors de la création de l'utilisateur)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      email: formData.email,
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      phone: formData.phone || null,
      role: formData.role,
      is_active: true,
      loyalty_points: 0,
    })
    .eq("id", newUser.id)

  if (profileError) {
    console.error("Erreur mise à jour profil:", profileError)
    // Nettoyage : supprimer l'utilisateur auth créé
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${newUser.id}`, {
      method: "DELETE",
      headers: {
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })
    return { error: profileError.message }
  }

  revalidatePath("/admin/users")
  return { success: true, userId: newUser.id }
}

export async function updateUser(userId: string, formData: {
  first_name?: string
  last_name?: string
  phone?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      phone: formData.phone || null,
    })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Supprimer le profil
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  if (profileError) return { error: profileError.message }

  // Supprimer l'utilisateur dans auth via API admin
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { success: true }
}