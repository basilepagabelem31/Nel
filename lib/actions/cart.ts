// Chemin : lib/actions/cart.ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Générer un numéro de commande unique
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `NH-${year}-${random}`
}

// Ajouter un article au panier
export async function addToCart(productId: string, quantity: number = 1, variantId?: string, redirectToCart: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Vous devez être connecté pour ajouter au panier", redirectToLogin: true }
  }

  // Récupérer ou créer un panier
  let cart = null
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (existingCart) {
    cart = existingCart
  } else {
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single()

    if (error) return { error: "Impossible de créer le panier" }
    cart = newCart
  }

  // Récupérer le prix du produit
  const { data: product } = await supabase
    .from("products")
    .select("base_price, discount_price, stock_quantity, name")
    .eq("id", productId)
    .single()

  if (!product) return { error: "Produit introuvable" }
  if (product.stock_quantity < quantity) return { error: "Stock insuffisant" }

  const unitPrice = product.discount_price || product.base_price

  // Vérifier si l'article est déjà dans le panier
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .eq("variant_id", variantId || null)
    .single()

  if (existingItem) {
    // Mettre à jour la quantité
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)

    if (error) return { error: "Impossible de mettre à jour le panier" }
  } else {
    // Ajouter un nouvel article
    const { error } = await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
      unit_price: unitPrice,
    })

    if (error) return { error: "Impossible d'ajouter au panier" }
  }

  revalidatePath("/panier")
  revalidatePath("/")
  
  // Rediriger vers le panier si demandé
  if (redirectToCart) {
    redirect("/panier")
  }
  
  return { success: true }
}

// Supprimer un article du panier
export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)

  if (error) return { error: "Impossible de supprimer l'article" }

  revalidatePath("/panier")
  return { success: true }
}

// Mettre à jour la quantité d'un article
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)

  if (error) return { error: "Impossible de mettre à jour" }

  revalidatePath("/panier")
  return { success: true }
}

// Récupérer le nombre d'articles dans le panier
export async function getCartCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 0

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!cart) return 0

  const { data: items } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id)

  return items?.reduce((sum, item) => sum + item.quantity, 0) || 0
}