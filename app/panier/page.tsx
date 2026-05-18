// Chemin : app/panier/page.tsx

import Link from "next/link"
import { ShoppingBag, ArrowRight, Tag } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { CartItems } from "@/components/cart/cart-items"
import { CartSummary } from "@/components/cart/cart-summary"

export const metadata = {
  title: "Mon panier",
}

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let cartItems: any[] = []

  if (user) {
    // Récupérer le panier actif de l'utilisateur
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
        .select(`
          *,
          products (
            id, name, slug, base_price, discount_price, stock_quantity,
            product_images (url, alt_text, is_primary)
          ),
          product_variants (color, size, additional_price)
        `)
        .eq("cart_id", cart.id)

      cartItems = items || []
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.discount_price || item.products?.base_price || 0
    return sum + (Number(price) * item.quantity)
  }, 0)

  const shippingFree = subtotal >= 100
  const shipping = shippingFree ? 0 : 9.99
  const total = subtotal + shipping

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Mon panier</h1>

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CartItems items={cartItems} />
              </div>

              <div className="lg:col-span-1">
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  shippingFree={shippingFree}
                  itemCount={cartItems.length}
                  isAuthenticated={!!user}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">
                Découvrez notre collection de mode africaine authentique
              </p>
              <Link href="/catalogue">
                <Button size="lg" className="gap-2">
                  Découvrir la boutique
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}