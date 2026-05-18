import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Admin Dashboard",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: usersCount },
    { data: recentOrders },
    { data: topProducts }
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders")
      .select("*, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("products")
      .select("id, name, base_price, stock_quantity")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5)
  ])

  // Calculate revenue (mock for now since we don't have real orders)
  const totalRevenue = recentOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0

  const stats = [
    {
      title: "Chiffre d affaires",
      value: `${totalRevenue.toFixed(2)} EUR`,
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Commandes",
      value: ordersCount || 0,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Produits",
      value: productsCount || 0,
      change: "+3",
      trend: "up",
      icon: Package,
      color: "text-amber-600 bg-amber-100"
    },
    {
      title: "Clients",
      value: usersCount || 0,
      change: "+24",
      trend: "up",
      icon: Users,
      color: "text-purple-600 bg-purple-100"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenue dans votre espace administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">ce mois</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes recentes</CardTitle>
              <CardDescription>Les 5 dernieres commandes</CardDescription>
            </div>
            <Button variant="outline" size="sm">Voir tout</Button>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">#{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.first_name} {order.profiles?.last_name || order.profiles?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Number(order.total_amount).toFixed(2)} EUR</p>
                      <Badge variant={
                        order.status === "delivered" ? "default" :
                        order.status === "shipped" ? "secondary" : "outline"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucune commande pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Produits populaires</CardTitle>
              <CardDescription>Les produits les plus consultes</CardDescription>
            </div>
            <Button variant="outline" size="sm">Voir tout</Button>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">{Number(product.base_price).toFixed(2)} EUR</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun produit pour le moment
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
