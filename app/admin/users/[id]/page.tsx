// Chemin : app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Gift, MapPin, Home, Building, Truck } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Détails de l'utilisateur | Admin",
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrateur", color: "bg-red-100 text-red-800" },
  gestionnaire: { label: "Gestionnaire", color: "bg-purple-100 text-purple-800" },
  conseiller: { label: "Conseiller", color: "bg-blue-100 text-blue-800" },
  client: { label: "Client", color: "bg-gray-100 text-gray-800" },
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  console.log("🔍 [Admin] ID utilisateur recherché:", id)

  // 1. Récupérer l'utilisateur
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (userError || !user) {
    console.error("❌ [Admin] Erreur utilisateur:", userError)
    notFound()
  }

  console.log("✅ [Admin] Utilisateur trouvé:", user.email)

  // 2. Récupérer les adresses de l'utilisateur
  const { data: addresses, error: addressesError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", id)

  if (addressesError) {
    console.error("❌ [Admin] Erreur lors de la récupération des adresses:", addressesError)
  } else {
    console.log("✅ [Admin] Adresses trouvées:", addresses?.length || 0)
    if (addresses && addresses.length > 0) {
      console.log("📦 [Admin] Première adresse:", JSON.stringify(addresses[0], null, 2))
    }
  }

  // 3. Récupérer les commandes
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, status, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "U"
  }

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email?.split("@")[0] || "Utilisateur"
  }

  const roleInfo = roleLabels[user.role] || roleLabels.client

  const getAddressIcon = (label: string | null) => {
    if (label === "Maison") return <Home className="h-4 w-4" />
    if (label === "Bureau") return <Building className="h-4 w-4" />
    return <MapPin className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Profil utilisateur</h1>
          <p className="text-muted-foreground">Consultez et gérez les informations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Avatar et infos principales */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{getDisplayName()}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-4">
                <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Points fidélité</p>
                  <p className="font-bold text-primary">{user.loyalty_points || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Inscription</p>
                  <p className="text-sm">{new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Détails */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Détails du compte utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION ADRESSES */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Adresses de livraison</CardTitle>
                  <CardDescription>
                    {addresses?.length || 0} adresse(s) enregistrée(s)
                  </CardDescription>
                </div>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getAddressIcon(address.label)}
                            {address.label && (
                              <span className="text-sm font-medium">{address.label}</span>
                            )}
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Par défaut
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{address.street}</p>
                          <p className="text-sm">
                            {address.zip_code && `${address.zip_code} `}{address.city}
                          </p>
                          {address.state && (
                            <p className="text-sm text-muted-foreground">{address.state}</p>
                          )}
                          <p className="text-sm font-medium mt-1">{address.country}</p>
                        </div>
                        <Truck className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune adresse enregistrée</p>
                  <p className="text-sm">Le client n'a pas encore ajouté d'adresse</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dernières commandes */}
          {orders && orders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dernières commandes</CardTitle>
                <CardDescription>Historique des commandes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{Number(order.total_amount).toFixed(2)} €</p>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                          order.status === "cancelled" ? "destructive" : "secondary"
                        }>
                          {order.status === "delivered" ? "Livrée" :
                           order.status === "shipped" ? "Expédiée" :
                           order.status === "preparing" ? "En préparation" :
                           order.status === "confirmed" ? "Confirmée" :
                           order.status === "cancelled" ? "Annulée" : "En attente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}