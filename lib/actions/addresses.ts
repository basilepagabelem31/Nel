// Chemin : lib/actions/addresses.ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addAddress(userId: string, formData: FormData) {
  const supabase = await createClient()

  const label = formData.get("label") as string
  const street = formData.get("street") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const zipCode = formData.get("zip_code") as string
  const country = formData.get("country") as string
  const isDefault = formData.get("is_default") === "true"

  if (!street || !city || !country) {
    return { error: "Adresse, ville et pays requis" }
  }

  // Si isDefault, retirer le défaut des autres adresses
  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    label,
    street,
    city,
    state,
    zip_code: zipCode,
    country: country || "France",
    is_default: isDefault,
  })

  if (error) return { error: "Impossible d'ajouter l'adresse" }

  revalidatePath("/dashboard/addresses")
  return { success: true }
}

export async function updateAddress(addressId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const isDefault = formData.get("is_default") === "true"

  if (isDefault) {
    const { data: addr } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", addressId)
      .single()

    if (addr) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", addr.user_id)
    }
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      label: formData.get("label") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zip_code: formData.get("zip_code") as string,
      country: formData.get("country") as string,
      is_default: isDefault,
    })
    .eq("id", addressId)

  if (error) return { error: "Impossible de mettre à jour" }

  revalidatePath("/dashboard/addresses")
  return { success: true }
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)

  if (error) return { error: "Impossible de supprimer" }

  revalidatePath("/dashboard/addresses")
  return { success: true }
}