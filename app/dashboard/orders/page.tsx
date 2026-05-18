import Link from "next/link"
import { Package, Eye, ArrowLeft, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Mes commandes",
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        products (name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Livree</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Expediee</Badge>
      case "preparing":
        return <Badge className="bg-amber-100 text-amber-800">En preparation</Badge>
      case "confirmed":
        return <Badge className="bg-purple-100 text-purple-800">Confirmee</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulee</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes commandes</h1>
          <p className="text-muted-foreground">Historique de toutes vos commandes</p>
        </div>
        <Link href="/catalogue">
          <Button>Continuer mes achats</Button>
        </Link>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      Commande #{order.order_number}
                    </CardTitle>
                    <CardDescription>
                      Passee le {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="font-bold">{Number(order.total_amount).toFixed(2)} EUR</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{item.products?.name || "Produit"}</p>
                        <p className="text-sm text-muted-foreground">Quantite: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{Number(item.unit_price).toFixed(2)} EUR</p>
                    </div>
                  ))}
                  {(order.order_items?.length || 0) > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.order_items.length - 3} autre(s) article(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Voir details
                  </Button>
                  {order.tracking_number && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Truck className="h-4 w-4" />
                      Suivre le colis
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-muted-foreground mb-6">
              Vous n avez pas encore passe de commande
            </p>
            <Link href="/catalogue">
              <Button>Decouvrir la boutique</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
