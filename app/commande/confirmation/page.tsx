// Chemin : app/commande/confirmation/page.tsx

import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Commande confirmée !",
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderNumber = params.order

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let order = null
  if (orderNumber && user) {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id, quantity, unit_price, total_price,
          products (name)
        ),
        addresses (street, city, country)
      `)
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single()

    order = data
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          {/* Success Banner */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
            {orderNumber && (
              <p className="text-muted-foreground">
                Numéro de commande : <span className="font-semibold text-foreground">#{orderNumber}</span>
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              Un email de confirmation a été envoyé à votre adresse email.
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">Récapitulatif de la commande</h2>

                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.products?.name} × {item.quantity}</span>
                      <span className="font-medium">{Number(item.total_price).toFixed(2)} EUR</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction</span>
                      <span>-{Number(order.discount_amount).toFixed(2)} EUR</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>{Number(order.shipping_amount) === 0 ? "Gratuite" : `${Number(order.shipping_amount).toFixed(2)} EUR`}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{Number(order.total_amount).toFixed(2)} EUR</span>
                  </div>
                </div>

                {order.addresses && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">Livraison à :</p>
                    <p className="text-sm font-medium">
                      {(order.addresses as any).street}, {(order.addresses as any).city}, {(order.addresses as any).country}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* What's next */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Et maintenant ?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Préparation en cours</p>
                    <p className="text-xs text-muted-foreground">
                      Notre équipe prépare votre commande avec soin
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expédition</p>
                    <p className="text-xs text-muted-foreground">
                      Vous recevrez un email avec votre numéro de suivi
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/orders">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Package className="h-4 w-4" />
                Suivre ma commande
              </Button>
            </Link>
            <Link href="/catalogue">
              <Button className="gap-2 w-full sm:w-auto">
                Continuer mes achats
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}