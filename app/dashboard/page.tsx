import Link from "next/link"
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Gift,
  ArrowRight,
  Package,
  Clock,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Tableau de bord",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user data
  const [
    { data: profile },
    { data: orders },
    { data: favorites },
    { count: addressCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("favorites").select("*, products(name, slug, base_price)").eq("user_id", user.id).limit(4),
    supabase.from("addresses").select("*", { count: "exact", head: true }).eq("user_id", user.id)
  ])

  const stats = [
    {
      label: "Commandes",
      value: orders?.length || 0,
      icon: ShoppingBag,
      href: "/dashboard/orders",
      color: "text-blue-600 bg-blue-100"
    },
    {
      label: "Favoris",
      value: favorites?.length || 0,
      icon: Heart,
      href: "/dashboard/favorites",
      color: "text-red-600 bg-red-100"
    },
    {
      label: "Adresses",
      value: addressCount || 0,
      icon: MapPin,
      href: "/dashboard/addresses",
      color: "text-green-600 bg-green-100"
    },
    {
      label: "Points fidelite",
      value: profile?.loyalty_points || 0,
      icon: Gift,
      href: "/dashboard/loyalty",
      color: "text-amber-600 bg-amber-100"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Bonjour, {profile?.first_name || "cher client"} !
        </h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre espace personnel Nella@House
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commandes recentes</CardTitle>
            <CardDescription>Vos dernieres commandes</CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {order.status === "delivered" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : order.status === "shipped" ? (
                        <Package className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Commande #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(order.total_amount).toFixed(2)} EUR</p>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                      order.status === "shipped" ? "secondary" : "outline"
                    }>
                      {order.status === "delivered" ? "Livree" :
                       order.status === "shipped" ? "Expediee" :
                       order.status === "confirmed" ? "Confirmee" : "En attente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucune commande pour le moment</p>
              <Link href="/catalogue">
                <Button>Decouvrir la boutique</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Besoin de conseils ?</h3>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Nos conseillers en style africain sont la pour vous accompagner
            </p>
            <Link href="/consultation">
              <Button variant="secondary">Prendre rendez-vous</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Programme fidelite</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Vous avez <span className="font-bold text-primary">{profile?.loyalty_points || 0} points</span>. 
              Continuez a cumuler pour des reductions exclusives !
            </p>
            <Link href="/dashboard/loyalty">
              <Button variant="outline">En savoir plus</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
