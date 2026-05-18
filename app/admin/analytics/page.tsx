// Chemin : app/admin/analytics/page.tsx

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { OrderStatusChart } from "@/components/admin/order-status-chart"

export const metadata = {
  title: "Statistiques",
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: orders },
    { data: products },
    { data: users },
    { data: consultations }
  ] = await Promise.all([
    supabase.from("orders").select("id, total_amount, status, created_at").order("created_at"),
    supabase.from("products").select("id, status, stock_quantity").eq("status", "published"),
    supabase.from("profiles").select("id, created_at, role"),
    supabase.from("consultations").select("id, status"),
  ])

  const totalRevenue = orders
    ?.filter(o => !["cancelled", "refunded"].includes(o.status))
    ?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  const clientsCount = users?.filter(u => u.role === "client").length || 0

  const lowStockCount = products?.filter(p => p.stock_quantity <= 5).length || 0

  // Orders par statut pour le graphique
  const orderStatusData = [
    { name: "En attente", value: orders?.filter(o => o.status === "pending").length || 0, color: "#f59e0b" },
    { name: "Confirmé", value: orders?.filter(o => o.status === "confirmed").length || 0, color: "#8b5cf6" },
    { name: "En préparation", value: orders?.filter(o => o.status === "preparing").length || 0, color: "#3b82f6" },
    { name: "Expédié", value: orders?.filter(o => o.status === "shipped").length || 0, color: "#06b6d4" },
    { name: "Livré", value: orders?.filter(o => o.status === "delivered").length || 0, color: "#10b981" },
    { name: "Annulé", value: orders?.filter(o => o.status === "cancelled").length || 0, color: "#ef4444" },
  ].filter(d => d.value > 0)

  // Revenue par mois (6 derniers mois)
  const now = new Date()
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

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: `${totalRevenue.toFixed(2)} EUR`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
      description: "Total des ventes (hors annulées)"
    },
    {
      title: "Total commandes",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
      description: `${orders?.filter(o => o.status === "delivered").length || 0} livrées`
    },
    {
      title: "Clients inscrits",
      value: clientsCount,
      icon: Users,
      color: "text-purple-600 bg-purple-100",
      description: `${users?.filter(u => {
        const d = new Date(u.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length || 0} ce mois`
    },
    {
      title: "Stock faible",
      value: lowStockCount,
      icon: Package,
      color: lowStockCount > 0 ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100",
      description: "Produits avec ≤ 5 unités"
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Vue d'ensemble des performances de la boutique</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
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

      {/* Consultations summary */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
          <CardDescription>État des demandes de conseil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { status: "pending", label: "En attente", color: "bg-amber-100 text-amber-800" },
              { status: "assigned", label: "Assignées", color: "bg-blue-100 text-blue-800" },
              { status: "in_progress", label: "En cours", color: "bg-purple-100 text-purple-800" },
              { status: "completed", label: "Traitées", color: "bg-green-100 text-green-800" },
              { status: "cancelled", label: "Annulées", color: "bg-red-100 text-red-800" },
            ].map(({ status, label, color }) => (
              <div key={status} className={`rounded-lg p-4 text-center ${color}`}>
                <p className="text-2xl font-bold">
                  {consultations?.filter(c => c.status === status).length || 0}
                </p>
                <p className="text-sm">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}