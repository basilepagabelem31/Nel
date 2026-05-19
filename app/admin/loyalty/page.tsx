// Chemin : app/admin/loyalty/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp, Users, Award, ShoppingCart, Star, Plus, X } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddPointsDialog } from "@/components/admin/add-points-dialog"

export const metadata = {
  title: "Programme de fidélité | Admin",
}

export default async function AdminLoyaltyPage() {
  const supabase = await createClient()

  // Récupérer tous les utilisateurs avec leurs points
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, loyalty_points, created_at, role")
    .order("loyalty_points", { ascending: false })

  // Récupérer toutes les transactions de fidélité
  const { data: transactions } = await supabase
    .from("loyalty_transactions")
    .select(`
      *,
      profiles (id, email, first_name, last_name),
      orders (order_number)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Statistiques globales
  const totalPoints = users?.reduce((sum, u) => sum + (u.loyalty_points || 0), 0) || 0
  const activeUsers = users?.filter(u => u.loyalty_points > 0).length || 0
  
  const now = new Date()
  const pointsEarnedThisMonth = transactions
    ?.filter(t => {
      const date = new Date(t.created_at)
      return t.type === "earned" && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    ?.reduce((sum, t) => sum + t.points, 0) || 0
    
  const pointsUsedThisMonth = transactions
    ?.filter(t => {
      const date = new Date(t.created_at)
      return t.type === "spent" && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    ?.reduce((sum, t) => sum + t.points, 0) || 0

  const topUsers = users?.slice(0, 10) || []
  const totalValue = Math.floor(totalPoints / 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programme de fidélité</h1>
          <p className="text-muted-foreground">Gérez les points et récompenses des clients</p>
        </div>
        <AddPointsDialog users={users || []} />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points distribués</p>
                <p className="text-2xl font-bold mt-1">{totalPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Valeur: {totalValue} €</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients actifs</p>
                <p className="text-2xl font-bold mt-1">{activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">avec points à utiliser</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points gagnés</p>
                <p className="text-2xl font-bold mt-1">{pointsEarnedThisMonth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">ce mois</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points utilisés</p>
                <p className="text-2xl font-bold mt-1">{pointsUsedThisMonth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">ce mois</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 des clients fidèles</CardTitle>
          <CardDescription>Clients avec le plus de points</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {user.first_name} {user.last_name || ""}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary">
                      {user.loyalty_points?.toLocaleString() || 0} pts
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.floor((user.loyalty_points || 0) / 100)} €</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {topUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur avec des points
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dernières transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
          <CardDescription>Historique récent des points attribués ou utilisés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Référence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {tx.profiles?.first_name} {tx.profiles?.last_name || ""}
                      <br />
                      <span className="text-xs text-muted-foreground">{tx.profiles?.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        tx.type === "earned" ? "default" : 
                        tx.type === "spent" ? "destructive" : "secondary"
                      }>
                        {tx.type === "earned" ? "Gagnés" : 
                         tx.type === "spent" ? "Utilisés" : "Expirés"}
                      </Badge>
                    </TableCell>
                    <TableCell className={tx.type === "earned" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {tx.type === "earned" ? "+" : "-"}{tx.points}
                    </TableCell>
                    <TableCell>
                      {tx.orders?.order_number ? (
                        <Link href={`/admin/orders/${tx.order_id}`} className="text-primary hover:underline">
                          #{tx.orders.order_number}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucune transaction de points
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Règles du programme */}
      <Card>
        <CardHeader>
          <CardTitle>Règles du programme de fidélité</CardTitle>
          <CardDescription>Comment les points sont attribués</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Achats</h3>
              </div>
              <p className="text-sm text-muted-foreground">10 points par euro dépensé</p>
              <p className="text-xs text-muted-foreground mt-1">Points crédités après confirmation de commande</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Avis produits</h3>
              </div>
              <p className="text-sm text-muted-foreground">50 points par avis approuvé</p>
              <p className="text-xs text-muted-foreground mt-1">Maximum 5 avis par mois</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Parrainage</h3>
              </div>
              <p className="text-sm text-muted-foreground">200 points par ami parrainé</p>
              <p className="text-xs text-muted-foreground mt-1">Le parrainé doit passer une commande</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Conversion</h3>
            <p className="text-sm text-muted-foreground">
              100 points = 1€ de réduction sur votre prochaine commande
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Les points expirent après 12 mois d'inactivité
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}