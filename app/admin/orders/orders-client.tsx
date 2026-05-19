// Chemin : app/admin/orders/orders-client.tsx
"use client"

import { useState } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateOrderStatus } from "@/lib/actions/orders"
import { toast } from "sonner"

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  profiles: { first_name: string; last_name: string; email: string }
  order_items: any[]
}

interface OrdersClientProps {
  initialOrders: Order[]
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Livrée</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Expédiée</Badge>
      case "preparing":
        return <Badge className="bg-amber-100 text-amber-800">En préparation</Badge>
      case "confirmed":
        return <Badge className="bg-purple-100 text-purple-800">Confirmée</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>
      case "refunded":
        return <Badge variant="secondary">Remboursée</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsPending(true)
    const result = await updateOrderStatus(orderId, newStatus)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Commande ${getStatusLabel(newStatus)}`)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    }
    setIsPending(false)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "confirmée"
      case "preparing": return "en préparation"
      case "shipped": return "expédiée"
      case "delivered": return "livrée"
      case "cancelled": return "annulée"
      default: return status
    }
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    setIsPending(true)
    const result = await updateOrderStatus(orderToCancel, "cancelled")
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Commande annulée")
      setOrders(orders.map(order => 
        order.id === orderToCancel ? { ...order, status: "cancelled" } : order
      ))
    }
    setIsPending(false)
    setOrderToCancel(null)
  }

  const pendingCount = orders?.filter(o => o.status === "pending").length || 0
  const preparingCount = orders?.filter(o => o.status === "preparing").length || 0
  const shippedCount = orders?.filter(o => o.status === "shipped").length || 0
  const deliveredCount = orders?.filter(o => o.status === "delivered").length || 0

  return (
    <>
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
              <p className="text-sm text-muted-foreground">En préparation</p>
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
              <p className="text-sm text-muted-foreground">Expédiées</p>
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
              <p className="text-sm text-muted-foreground">Livrées</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>{order.order_items?.length || 0} article(s)</TableCell>
                    <TableCell className="font-bold">{Number(order.total_amount).toFixed(2)} EUR</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div suppressHydrationWarning>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "confirmed")}>
                                Confirmer
                              </DropdownMenuItem>
                            )}
                            {order.status === "confirmed" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "preparing")}>
                                Marquer en préparation
                              </DropdownMenuItem>
                            )}
                            {order.status === "preparing" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "shipped")}>
                                Marquer expédiée
                              </DropdownMenuItem>
                            )}
                            {order.status === "shipped" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "delivered")}>
                                Marquer livrée
                              </DropdownMenuItem>
                            )}
                            {(order.status === "pending" || order.status === "confirmed") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setOrderToCancel(order.id)}
                                >
                                  Annuler
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

      <AlertDialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
              {isPending ? "Annulation..." : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}