// Chemin : app/dashboard/reviews/page.tsx

import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Mes avis",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      products (name, slug)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: "En attente", variant: "outline" },
    approved: { label: "Approuvé", variant: "default" },
    rejected: { label: "Refusé", variant: "destructive" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes avis</h1>
        <p className="text-muted-foreground">
          {reviews?.length || 0} avis soumis
        </p>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = statusMap[review.status] || statusMap.pending
            return (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/produit/${(review.products as any)?.slug}`}>
                        <CardTitle className="text-base hover:text-primary transition-colors">
                          {(review.products as any)?.name || "Produit"}
                        </CardTitle>
                      </Link>
                      <CardDescription>
                        Soumis le {new Date(review.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun avis</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore laissé d'avis. Partagez votre expérience sur les produits que vous avez commandés !
            </p>
            <Link href="/dashboard/orders">
              <Button>Voir mes commandes</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}