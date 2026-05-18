// Chemin : app/admin/promo-codes/page.tsx

import { Tag, Plus, ToggleLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { AddPromoCodeDialog } from "@/components/admin/add-promo-code-dialog"
import { PromoCodeActions } from "@/components/admin/promo-code-actions"

export const metadata = {
  title: "Codes promotionnels",
}

export default async function AdminPromoCodesPage() {
  const supabase = await createClient()

  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  const activeCount = promoCodes?.filter(p => p.is_active).length || 0
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Codes promotionnels</h1>
          <p className="text-muted-foreground">Créez et gérez vos codes de réduction</p>
        </div>
        <AddPromoCodeDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{promoCodes?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total codes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {promoCodes?.reduce((sum, p) => sum + (p.used_count || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Utilisations totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">
              {promoCodes?.filter(p => p.end_date < today && p.is_active).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Expirés actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les codes promo</CardTitle>
          <CardDescription>{promoCodes?.length || 0} codes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Min. commande</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes && promoCodes.length > 0 ? (
                promoCodes.map((promo) => {
                  const isExpired = promo.end_date < today
                  const isFull = promo.max_uses !== null && promo.used_count >= promo.max_uses

                  return (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-primary">{promo.code}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {promo.type === "percentage" ? "Pourcentage" : "Montant fixe"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {promo.type === "percentage"
                          ? `${promo.value}%`
                          : `${Number(promo.value).toFixed(2)} EUR`
                        }
                      </TableCell>
                      <TableCell>
                        {promo.min_order_amount
                          ? `${Number(promo.min_order_amount).toFixed(2)} EUR`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {promo.used_count}
                        {promo.max_uses && ` / ${promo.max_uses}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{new Date(promo.start_date).toLocaleDateString("fr-FR")}</p>
                          <p className={isExpired ? "text-red-500" : "text-muted-foreground"}>
                            → {new Date(promo.end_date).toLocaleDateString("fr-FR")}
                            {isExpired && " (expiré)"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.is_active && !isExpired && !isFull ? (
                          <Badge className="bg-green-100 text-green-800">Actif</Badge>
                        ) : isFull ? (
                          <Badge variant="secondary">Épuisé</Badge>
                        ) : isExpired ? (
                          <Badge variant="secondary">Expiré</Badge>
                        ) : (
                          <Badge variant="outline">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <PromoCodeActions promoCode={promo} />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun code promotionnel. Créez-en un pour commencer.
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