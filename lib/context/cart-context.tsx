// Chemin : lib/context/cart-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface CartContextType {
  cartCount: number
  refreshCart: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
  isLoading: false,
})

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCart = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setCartCount(0)
      setIsLoading(false)
      return
    }

    // Récupérer le panier de l'utilisateur
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (cart) {
      const { data: items } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("cart_id", cart.id)

      const total = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(total)
    } else {
      setCartCount(0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    refreshCart()

    // Écouter les changements d'authentification
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshCart()
    })

    // Écouter les changements dans le panier
    const channel = supabase
      .channel("cart-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items" },
        () => {
          refreshCart()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}