
// Chemin : app/dashboard/loyalty/page.tsx

import { Gift, Star, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Programme fidélité",
}

export default async function LoyaltyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: profile },
    { data: transactions }
  ] = await Promise.all([
    supabase.from("profiles").select("loyalty_points, first_name").eq("id", user.id).single(),
    supabase
      .from("loyalty_transactions")
      .select("*, orders(order_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
  ])

  const points = profile?.loyalty_points || 0

  // Niveaux de fidélité
  const levels = [
    { name: "Bronze", min: 0, max: 500, color: "text-amber-700" },
    { name: "Argent", min: 500, max: 2000, color: "text-gray-500" },
    { name: "Or", min: 2000, max: 5000, color: "text-yellow-500" },
    { name: "Platine", min: 5000, max: Infinity, color: "text-cyan-500" },
  ]

  const currentLevel = levels.find(l => points >= l.min && points < l.max) || levels[0]
  const nextLevel = levels[levels.indexOf(currentLevel) + 1]
  const progressToNext = nextLevel
    ? Math.min(100, ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100

  // 100 points = 1 EUR de réduction
  const reductionValue = Math.floor(points / 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programme fidélité</h1>
        <p className="text-muted-foreground">Cumulez des points et bénéficiez de réductions exclusives</p>
      </div>

      {/* Points Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-80" />
            <p className="text-4xl font-bold">{points.toLocaleString()}</p>
            <p className="text-primary-foreground/80 mt-1">points disponibles</p>
            <p className="text-sm mt-3 opacity-80">
              = {reductionValue} EUR de réduction
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Votre niveau : <span className={currentLevel.color}>{currentLevel.name}</span></CardTitle>
            <CardDescription>
              {nextLevel
                ? `Plus que ${nextLevel.min - points} points pour atteindre le niveau ${nextLevel.name}`
                : "Vous avez atteint le niveau maximum !"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressToNext} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{currentLevel.name} ({currentLevel.min} pts)</span>
              {nextLevel && <span>{nextLevel.name} ({nextLevel.min} pts)</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold text-primary">{reductionValue} EUR</p>
                <p className="text-xs text-muted-foreground">Valeur convertible</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">10 pts / EUR</p>
                <p className="text-xs text-muted-foreground">Taux d'acquisition</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comment gagner des points */}
      <Card>
        <CardHeader>
          <CardTitle>Comment gagner des points ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Achats</p>
                <p className="text-xs text-muted-foreground">10 points par euro dépensé</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Avis clients</p>
                <p className="text-xs text-muted-foreground">50 points par avis publié</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Parrainage</p>
                <p className="text-xs text-muted-foreground">200 points par ami parrainé</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des points</CardTitle>
          <CardDescription>Vos 20 dernières transactions de points</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "earned" ? "bg-green-100" :
                      tx.type === "spent" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      {tx.type === "earned" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : tx.type === "spent" ? (
                        <Gift className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || (
                        tx.type === "earned" ? "Points gagnés" :
                        tx.type === "spent" ? "Points utilisés" : "Points expirés"
                      )}</p>
                      {(tx.orders as any)?.order_number && (
                        <p className="text-xs text-muted-foreground">
                          Commande #{(tx.orders as any).order_number}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    tx.type === "earned" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.type === "earned" ? "+" : "-"}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune transaction de points pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}