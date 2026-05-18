import Link from "next/link"
import { Eye, MoreHorizontal, Package, Truck, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Gestion des Commandes",
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (first_name, last_name, email),
      order_items (id)
    `)
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
      case "refunded":
        return <Badge variant="secondary">Remboursee</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  // Stats
  const pendingCount = orders?.filter(o => o.status === "pending").length || 0
  const preparingCount = orders?.filter(o => o.status === "preparing").length || 0
  const shippedCount = orders?.filter(o => o.status === "shipped").length || 0
  const deliveredCount = orders?.filter(o => o.status === "delivered").length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-muted-foreground">Gerez les commandes de vos clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{preparingCount}</p>
              <p className="text-sm text-muted-foreground">En preparation</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{shippedCount}</p>
              <p className="text-sm text-muted-foreground">Expediees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deliveredCount}</p>
              <p className="text-sm text-muted-foreground">Livrees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les commandes</CardTitle>
          <CardDescription>{orders?.length || 0} commandes au total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      {order.order_items?.length || 0} article(s)
                    </TableCell>
                    <TableCell className="font-bold">
                      {Number(order.total_amount).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Confirmer</DropdownMenuItem>
                          <DropdownMenuItem>Marquer en preparation</DropdownMenuItem>
                          <DropdownMenuItem>Marquer expediee</DropdownMenuItem>
                          <DropdownMenuItem>Marquer livree</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune commande pour le moment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
