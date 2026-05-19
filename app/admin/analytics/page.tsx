// Chemin : app/admin/analytics/page.tsx
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, Users, Package, AlertCircle } from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { OrderStatusChart } from "@/components/admin/order-status-chart"

export const metadata = {
  title: "Tableau de bord | Statistiques",
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Récupérer les commandes avec plus de détails
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total_amount,
      status,
      created_at,
      profiles (first_name, last_name, email)
    `)
    .order("created_at", { ascending: false })

  // Récupérer les produits
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, base_price, discount_price, status, stock_quantity, created_at")
    .order("created_at", { ascending: false })

  // Récupérer les utilisateurs
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, is_active, created_at, loyalty_points")
    .order("created_at", { ascending: false })

  // Récupérer les consultations
  const { data: consultations } = await supabase
    .from("consultations")
    .select("id, status, created_at, client_id, advisor_id")
    .order("created_at", { ascending: false })

  // ============ STATISTIQUES RÉELLES ============

  // Chiffre d'affaires total (hors annulées et remboursées)
  const totalRevenue = orders
    ?.filter(o => !["cancelled", "refunded"].includes(o.status))
    ?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  // Chiffre d'affaires du mois en cours
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyRevenue = orders
    ?.filter(o => {
      const orderDate = new Date(o.created_at)
      return orderDate >= startOfMonth && !["cancelled", "refunded"].includes(o.status)
    })
    ?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  // Nombre de commandes totales
  const totalOrders = orders?.length || 0

  // Commandes livrées
  const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0

  // Nombre de clients (rôle = client)
  const clientsCount = users?.filter(u => u.role === "client").length || 0

  // Nouveaux clients ce mois
  const newClientsThisMonth = users?.filter(u => {
    const createdAt = new Date(u.created_at)
    return createdAt >= startOfMonth && u.role === "client"
  }).length || 0

  // Produits en stock faible (≤ 5 unités)
  const lowStockProducts = products?.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0 && p.status === "published") || []
  const lowStockCount = lowStockProducts.length

  // Produits en rupture de stock
  const outOfStockProducts = products?.filter(p => p.stock_quantity === 0 && p.status === "published") || []
  const outOfStockCount = outOfStockProducts.length

  // Produits brouillon
  const draftProducts = products?.filter(p => p.status === "draft") || []
  const draftCount = draftProducts.length

  // Taux de conversion (commandes / clients)
  const conversionRate = clientsCount > 0 ? ((totalOrders / clientsCount) * 100).toFixed(1) : 0

  // Panier moyen
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0

  // Données pour le graphique des revenus (6 derniers mois)
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthStr = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
    const monthRevenue = orders
      ?.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate.getMonth() === d.getMonth() &&
               orderDate.getFullYear() === d.getFullYear() &&
               !["cancelled", "refunded"].includes(o.status)
      })
      ?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

    return { month: monthStr, revenue: Math.round(monthRevenue * 100) / 100 }
  })

  // Données pour le graphique des statuts de commandes
  const orderStatusData = [
    { name: "En attente", value: orders?.filter(o => o.status === "pending").length || 0, color: "#f59e0b" },
    { name: "Confirmée", value: orders?.filter(o => o.status === "confirmed").length || 0, color: "#8b5cf6" },
    { name: "Préparation", value: orders?.filter(o => o.status === "preparing").length || 0, color: "#3b82f6" },
    { name: "Expédiée", value: orders?.filter(o => o.status === "shipped").length || 0, color: "#06b6d4" },
    { name: "Livrée", value: deliveredOrders, color: "#10b981" },
    { name: "Annulée", value: orders?.filter(o => o.status === "cancelled").length || 0, color: "#ef4444" },
  ].filter(d => d.value > 0)

  // Statistiques des consultations
  const consultationStats = {
    pending: consultations?.filter(c => c.status === "pending").length || 0,
    assigned: consultations?.filter(c => c.status === "assigned").length || 0,
    in_progress: consultations?.filter(c => c.status === "in_progress").length || 0,
    completed: consultations?.filter(c => c.status === "completed").length || 0,
    cancelled: consultations?.filter(c => c.status === "cancelled").length || 0,
  }

  // Produits les plus vendus (top 5)
  const { data: topProducts } = await supabase
    .from("order_items")
    .select(`
      product_id,
      quantity,
      products (id, name, slug, base_price, product_images(url))
    `)
    .limit(100)

  const productSalesMap = new Map()
  topProducts?.forEach(item => {
    if (item.product_id) {
      const current = productSalesMap.get(item.product_id) || 0
      productSalesMap.set(item.product_id, current + item.quantity)
    }
  })

  const topSellingProducts = Array.from(productSalesMap.entries())
    .map(([id, quantity]) => ({
      id,
      quantity,
      product: topProducts?.find(p => p.product_id === id)?.products
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble des performances de la boutique</p>
      </div>

      {/* KPIs avec liens cliquables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carte Chiffre d'affaires */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold mt-1">{totalRevenue.toFixed(2)} €</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthlyRevenue.toFixed(2)} € ce mois
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Total commandes (cliquable) */}
        <Link href="/admin/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total commandes</p>
                  <p className="text-2xl font-bold mt-1">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deliveredOrders} livrées - Panier moyen: {averageOrderValue} €
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Carte Clients inscrits (cliquable) */}
        <Link href="/admin/users?role=client">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients inscrits</p>
                  <p className="text-2xl font-bold mt-1">{clientsCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{newClientsThisMonth} ce mois - Taux conversion: {conversionRate}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Carte Stock faible (cliquable) */}
        <Link href="/admin/products?filter=low-stock">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerte stock</p>
                  <p className="text-2xl font-bold mt-1">{lowStockCount + outOfStockCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowStockCount} stock faible, {outOfStockCount} rupture
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${lowStockCount + outOfStockCount > 0 ? "bg-red-100" : "bg-green-100"} flex items-center justify-center`}>
                  <Package className={`h-6 w-6 ${lowStockCount + outOfStockCount > 0 ? "text-red-600" : "text-green-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Graphiques */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenus mensuels</CardTitle>
            <CardDescription>6 derniers mois (EUR)</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statuts des commandes</CardTitle>
            <CardDescription>Répartition actuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={orderStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Produits les plus vendus */}
      <Card>
        <CardHeader>
          <CardTitle>Top produits</CardTitle>
          <CardDescription>Les 5 produits les plus vendus</CardDescription>
        </CardHeader>
        <CardContent>
          {topSellingProducts.length > 0 ? (
            <div className="space-y-4">
              {topSellingProducts.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{item.product?.name || "Produit inconnu"}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} exemplaire(s) vendus
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/products/${item.id}/edit`}>
                    <button className="text-sm text-primary hover:underline">Voir</button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée de vente disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Consultations summary */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
          <CardDescription>État des demandes de conseil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { status: "pending", label: "En attente", value: consultationStats.pending, color: "bg-amber-100 text-amber-800" },
              { status: "assigned", label: "Assignées", value: consultationStats.assigned, color: "bg-blue-100 text-blue-800" },
              { status: "in_progress", label: "En cours", value: consultationStats.in_progress, color: "bg-purple-100 text-purple-800" },
              { status: "completed", label: "Traitées", value: consultationStats.completed, color: "bg-green-100 text-green-800" },
              { status: "cancelled", label: "Annulées", value: consultationStats.cancelled, color: "bg-red-100 text-red-800" },
            ].map((item) => (
              <Link key={item.status} href={`/admin/consultations?status=${item.status}`}>
                <div className={`rounded-lg p-4 text-center cursor-pointer hover:opacity-80 transition-opacity ${item.color}`}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes stock */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0 || draftProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alertes et attention
            </CardTitle>
            <CardDescription>Points nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outOfStockProducts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">⚠️ Produits en rupture de stock</p>
                    <p className="text-sm text-red-600">{outOfStockProducts.length} produit(s) à réapprovisionner</p>
                  </div>
                  <Link href="/admin/products?filter=out-of-stock">
                    <button className="text-sm text-red-700 hover:underline">Voir</button>
                  </Link>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-800">📦 Stock faible</p>
                    <p className="text-sm text-amber-600">{lowStockProducts.length} produit(s) avec moins de 5 unités</p>
                  </div>
                  <Link href="/admin/products?filter=low-stock">
                    <button className="text-sm text-amber-700 hover:underline">Voir</button>
                  </Link>
                </div>
              )}
              {draftProducts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">📝 Produits en brouillon</p>
                    <p className="text-sm text-blue-600">{draftProducts.length} produit(s) non publiés</p>
                  </div>
                  <Link href="/admin/products?filter=draft">
                    <button className="text-sm text-blue-700 hover:underline">Voir</button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}