// Chemin : lib/actions/products.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function generateSKU(): string {
  return `NH-${Date.now().toString(36).toUpperCase()}`
}

// Créer un produit
export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const name = formData.get("name") as string
  const categoryId = formData.get("category_id") as string
  const description = formData.get("description") as string
  const composition = formData.get("composition") as string
  const originCountry = formData.get("origin_country") as string
  const basePrice = parseFloat(formData.get("base_price") as string)
  const discountPrice = formData.get("discount_price") ? parseFloat(formData.get("discount_price") as string) : null
  const stockQuantity = parseInt(formData.get("stock_quantity") as string) || 0
  const status = formData.get("status") as "draft" | "published" | "archived"
  const isFeatured = formData.get("is_featured") === "true"

  if (!name || !basePrice) return { error: "Nom et prix requis" }

  const slug = slugify(name)
  const sku = generateSKU()

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      sku,
      category_id: categoryId || null,
      description,
      composition,
      origin_country: originCountry,
      base_price: basePrice,
      discount_price: discountPrice,
      stock_quantity: stockQuantity,
      status: status || "draft",
      is_featured: isFeatured,
    })
    .select("id")
    .single()

  if (error) return { error: `Erreur: ${error.message}` }

  revalidatePath("/admin/products")
  redirect(`/admin/products/${product.id}/edit`)
}

// Mettre à jour un produit
export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const name = formData.get("name") as string
  const categoryId = formData.get("category_id") as string
  const description = formData.get("description") as string
  const composition = formData.get("composition") as string
  const originCountry = formData.get("origin_country") as string
  const basePrice = parseFloat(formData.get("base_price") as string)
  const discountPrice = formData.get("discount_price") ? parseFloat(formData.get("discount_price") as string) : null
  const stockQuantity = parseInt(formData.get("stock_quantity") as string) || 0
  const status = formData.get("status") as "draft" | "published" | "archived"
  const isFeatured = formData.get("is_featured") === "true"

  const { error } = await supabase
    .from("products")
    .update({
      name,
      category_id: categoryId || null,
      description,
      composition,
      origin_country: originCountry,
      base_price: basePrice,
      discount_price: discountPrice,
      stock_quantity: stockQuantity,
      status,
      is_featured: isFeatured,
    })
    .eq("id", productId)

  if (error) return { error: `Erreur: ${error.message}` }

  revalidatePath("/admin/products")
  return { success: true }
}

// Supprimer un produit
export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)

  if (error) return { error: "Impossible de supprimer" }

  revalidatePath("/admin/products")
  return { success: true }
}

// Changer le statut d'un produit
export async function updateProductStatus(productId: string, status: "draft" | "published" | "archived") {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId)

  if (error) return { error: "Impossible de mettre à jour" }

  revalidatePath("/admin/products")
  return { success: true }
}