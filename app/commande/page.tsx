// Chemin : app/commande/page.tsx

import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata = {
  title: "Finaliser ma commande",
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/commande")
  }

  // Récupérer panier, adresses, profil
  const [{ data: cart }, { data: addresses }, { data: profile }] = await Promise.all([
    supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("profiles")
      .select("first_name, last_name, email, phone, loyalty_points")
      .eq("id", user.id)
      .single(),
  ])

  let cartItems: any[] = []

  if (cart) {
    const { data: items } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (id, name, slug, base_price, discount_price, stock_quantity, product_images(url, is_primary)),
        product_variants (color, size, additional_price)
      `)
      .eq("cart_id", cart.id)

    cartItems = items || []
  }

  if (cartItems.length === 0) {
    redirect("/panier")
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.discount_price || item.products?.base_price || 0
    return sum + (Number(price) * item.quantity)
  }, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Finaliser ma commande</h1>
          <CheckoutForm
            cartItems={cartItems}
            addresses={addresses || []}
            profile={profile}
            userId={user.id}
            cartId={cart?.id || ""}
            subtotal={subtotal}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}