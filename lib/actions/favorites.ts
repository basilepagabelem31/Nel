// Chemin : lib/actions/favorites.ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// Basculer favori (ajouter/supprimer)
export async function toggleFavorite(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Vous devez être connecté" }
  }

  // Vérifier si déjà en favori
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single()

  if (existing) {
    // Supprimer le favori
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)

    if (error) return { error: "Impossible de supprimer le favori" }
    revalidatePath("/dashboard/favorites")
    return { success: true, isFavorite: false }
  } else {
    // Ajouter le favori
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      product_id: productId,
    })

    if (error) return { error: "Impossible d'ajouter aux favoris" }
    revalidatePath("/dashboard/favorites")
    return { success: true, isFavorite: true }
  }
}