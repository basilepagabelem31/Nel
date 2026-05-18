// Chemin : app/dashboard/addresses/page.tsx

import { MapPin, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { AddressCard } from "@/components/dashboard/address-card"
import { AddAddressDialog } from "@/components/dashboard/add-address-dialog"

export const metadata = {
  title: "Mes adresses",
}

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes adresses</h1>
          <p className="text-muted-foreground">
            {addresses?.length || 0} adresse{(addresses?.length || 0) > 1 ? "s" : ""} enregistrée{(addresses?.length || 0) > 1 ? "s" : ""}
          </p>
        </div>
        <AddAddressDialog userId={user.id} />
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune adresse</h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez une adresse de livraison pour passer vos commandes plus facilement
            </p>
            <AddAddressDialog userId={user.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}