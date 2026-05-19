// Chemin : app/admin/orders/[id]/order-detail-client.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateOrderStatus } from "@/lib/actions/orders"
import { toast } from "sonner"

const statusOptions = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "preparing", label: "En préparation" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
]

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "En préparation", color: "bg-purple-100 text-purple-800", icon: Package },
  shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle },
  refunded: { label: "Remboursée", color: "bg-orange-100 text-orange-800", icon: XCircle },
}

interface OrderDetailClientProps {
  order: any
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "")

  const currentStatus = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = currentStatus.icon

  const handleStatusUpdate = async () => {
    setIsPending(true)
    const result = await updateOrderStatus(order.id, selectedStatus, trackingNumber)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Statut mis à jour : ${statusConfig[selectedStatus]?.label}`)
      router.refresh()
    }
    setIsPending(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Commande #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Créée le {new Date(order.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Badge className={`${currentStatus.color} flex items-center gap-1 ml-auto`}>
          <StatusIcon className="h-3 w-3" />
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Infos client et livraison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Produits */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity} × {Number(item.unit_price).toFixed(2)} €
                      </p>
                    </div>
                    <p className="font-medium">{Number(item.total_price).toFixed(2)} €</p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{Number(order.total_amount + order.discount_amount - order.shipping_amount).toFixed(2)} €</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction</span>
                      <span>-{Number(order.discount_amount).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>{Number(order.shipping_amount) === 0 ? "Gratuite" : `${Number(order.shipping_amount).toFixed(2)} €`}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{Number(order.total_amount).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments && order.payments.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="capitalize">{order.payments[0].provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={order.payments[0].status === "completed" ? "default" : "secondary"}>
                      {order.payments[0].status === "completed" ? "Payé" : "En attente"}
                    </Badge>
                  </div>
                  {order.payments[0].paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de paiement</span>
                      <span>{new Date(order.payments[0].paid_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune information de paiement</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Actions et livraison */}
        <div className="space-y-6">
          {/* Mise à jour du statut */}
          <Card>
            <CardHeader>
              <CardTitle>Mettre à jour le statut</CardTitle>
              <CardDescription>Modifiez l'état de cette commande</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro de suivi (optionnel)</Label>
                <Input 
                  placeholder="Ex: LP123456789FR" 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleStatusUpdate} 
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.profiles?.first_name} {order.profiles?.last_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.profiles?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.profiles?.phone || "Non renseigné"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Adresse de livraison */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              {order.addresses ? (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p>{order.addresses.street}</p>
                    <p>{order.addresses.postal_code} {order.addresses.city}</p>
                    <p>{order.addresses.country}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Adresse non renseignée</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}