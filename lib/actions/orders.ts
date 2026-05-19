// Chemin : lib/actions/orders.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// Générer un numéro de commande unique
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `NH-${year}-${random}`
}

// Créer une commande depuis le panier
export async function createOrder(formData: {
  addressId: string
  cartId: string
  promoCode?: string
  notes?: string
  paymentMethod: "stripe" | "paypal" | "mobile_money" | "bank_transfer"
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  // Récupérer les articles du panier
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (id, name, base_price, discount_price, stock_quantity)
    `)
    .eq("cart_id", formData.cartId)

  if (!cartItems || cartItems.length === 0) {
    return { error: "Panier vide" }
  }

  // Calculer les totaux
  let subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.discount_price || item.products?.base_price || 0
    return sum + Number(price) * item.quantity
  }, 0)

  let discountAmount = 0
  let promoCodeId = null

  // Appliquer le code promo
  if (formData.promoCode) {
    const today = new Date().toISOString().split("T")[0]
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", formData.promoCode.toUpperCase())
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .single()

    if (promo) {
      if (!promo.min_order_amount || subtotal >= promo.min_order_amount) {
        if (!promo.max_uses || promo.used_count < promo.max_uses) {
          if (promo.type === "percentage") {
            discountAmount = (subtotal * promo.value) / 100
          } else {
            discountAmount = Math.min(promo.value, subtotal)
          }
          promoCodeId = promo.id

          // Incrémenter used_count
          await supabase
            .from("promo_codes")
            .update({ used_count: promo.used_count + 1 })
            .eq("id", promo.id)
        }
      }
    }
  }

  const shippingAmount = (subtotal - discountAmount) >= 100 ? 0 : 9.99
  const totalAmount = subtotal - discountAmount + shippingAmount

  // Créer la commande
  const orderNumber = generateOrderNumber()
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: formData.addressId || null,
      status: "pending",
      total_amount: totalAmount,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      promo_code_id: promoCodeId,
      notes: formData.notes || null,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    return { error: "Impossible de créer la commande" }
  }

  // Créer les order_items et mettre à jour les stocks
  for (const item of cartItems) {
    const price = item.products?.discount_price || item.products?.base_price || 0
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: price,
      total_price: Number(price) * item.quantity,
    })

    // Décrémenter le stock
    if (item.products) {
      await supabase
        .from("products")
        .update({ stock_quantity: Math.max(0, item.products.stock_quantity - item.quantity) })
        .eq("id", item.product_id)
    }
  }

  // Créer le paiement
  await supabase.from("payments").insert({
    order_id: order.id,
    provider: formData.paymentMethod,
    amount: totalAmount,
    currency: "EUR",
    status: "pending",
  })

  // Créer la transaction de fidélité (10 pts par euro)
  const pointsEarned = Math.floor(totalAmount * 10)
  if (pointsEarned > 0) {
    await supabase.from("loyalty_transactions").insert({
      user_id: user.id,
      order_id: order.id,
      type: "earned",
      points: pointsEarned,
      description: `Points gagnés sur la commande #${orderNumber}`,
    })

    // Mettre à jour le total de points
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single()

    await supabase
      .from("profiles")
      .update({ loyalty_points: (profile?.loyalty_points || 0) + pointsEarned })
      .eq("id", user.id)
  }

  // Créer une notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "in_app",
    subject: "Commande confirmée",
    content: `Votre commande #${orderNumber} a été reçue et sera traitée dans les plus brefs délais.`,
  })

  // Vider le panier
  await supabase.from("cart_items").delete().eq("cart_id", formData.cartId)
  await supabase.from("carts").delete().eq("id", formData.cartId)

  revalidatePath("/dashboard/orders")
  redirect(`/commande/confirmation?order=${orderNumber}`)
}

// Mise à jour du statut d'une commande (admin)
export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!["admin", "manager"].includes(profile?.role || "")) {
    return { error: "Permission refusée" }
  }

  const updates: Record<string, any> = { status }
  if (trackingNumber) updates.tracking_number = trackingNumber

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)

  if (error) return { error: "Impossible de mettre à jour la commande" }

  // Récupérer la commande pour notifier le client
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, user_id")
    .eq("id", orderId)
    .single()

  if (order) {
    const statusLabels: Record<string, string> = {
      confirmed: "confirmée",
      preparing: "en préparation",
      shipped: "expédiée",
      delivered: "livrée",
      cancelled: "annulée",
    }

    await supabase.from("notifications").insert({
      user_id: order.user_id,
      type: "in_app",
      subject: `Commande ${statusLabels[status] || status}`,
      content: `Votre commande #${order.order_number} est maintenant ${statusLabels[status] || status}.${trackingNumber ? ` Numéro de suivi : ${trackingNumber}` : ""}`,
    })
  }

  revalidatePath("/admin/orders")
  return { success: true }
}











// À ajouter dans lib/actions/orders.ts (après updateOrderStatus)

// Créer une commande en attente de paiement (pour Stripe)
export async function createPendingOrder(formData: {
  addressId: string
  cartId: string
  promoCode?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autorisé")

  // Récupérer les articles du panier
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (id, name, base_price, discount_price, stock_quantity, product_images(url, is_primary))
    `)
    .eq("cart_id", formData.cartId)

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Panier vide")
  }

  // Calculer les totaux
  let subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.discount_price || item.products?.base_price || 0
    return sum + Number(price) * item.quantity
  }, 0)

  let discountAmount = 0
  let promoCodeId = null

  // Appliquer le code promo
  if (formData.promoCode) {
    const today = new Date().toISOString().split("T")[0]
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", formData.promoCode.toUpperCase())
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .single()

    if (promo) {
      if (!promo.min_order_amount || subtotal >= promo.min_order_amount) {
        if (!promo.max_uses || promo.used_count < promo.max_uses) {
          if (promo.type === "percentage") {
            discountAmount = (subtotal * promo.value) / 100
          } else {
            discountAmount = Math.min(promo.value, subtotal)
          }
          promoCodeId = promo.id
          await supabase
            .from("promo_codes")
            .update({ used_count: promo.used_count + 1 })
            .eq("id", promo.id)
        }
      }
    }
  }

  const shippingAmount = subtotal - discountAmount >= 100 ? 0 : 9.99
  const totalAmount = subtotal - discountAmount + shippingAmount
  const orderNumber = generateOrderNumber()

  // Créer la commande avec status 'pending'
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: formData.addressId || null,
      status: "pending",
      total_amount: totalAmount,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      promo_code_id: promoCodeId,
      notes: formData.notes || null,
    })
    .select("id")
    .single()

  if (orderError || !order) throw new Error("Impossible de créer la commande")

  // Créer les order_items (sans décrémenter stock)
  for (const item of cartItems) {
    const price = item.products?.discount_price || item.products?.base_price || 0
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: price,
      total_price: Number(price) * item.quantity,
    })
  }

  // Créer le paiement en attente
  await supabase.from("payments").insert({
    order_id: order.id,
    provider: "stripe",
    amount: totalAmount,
    currency: "EUR",
    status: "pending",
  })

  return {
    orderId: order.id,
    orderNumber,
    totalAmount,
    items: cartItems.map((item) => {
      const price = item.products?.discount_price || item.products?.base_price || 0
      const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary) || item.products?.product_images?.[0]
      return {
        id: item.product_id,
        name: item.products?.name,
        price: Number(price),
        quantity: item.quantity,
        image: primaryImage?.url,
      }
    }),
  }
}