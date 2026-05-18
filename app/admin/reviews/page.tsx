// Chemin : app/admin/reviews/page.tsx

import { Star } from "lucide-react"
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
import { ReviewActions } from "@/components/admin/review-actions"

export const metadata = {
  title: "Modération des avis",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      products (name, slug),
      profiles (first_name, last_name, email)
    `)
    .order("created_at", { ascending: false })

  const pendingCount = reviews?.filter(r => r.status === "pending").length || 0
  const approvedCount = reviews?.filter(r => r.status === "approved").length || 0
  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—"

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-amber-100 text-amber-800" },
    approved: { label: "Approuvé", className: "bg-green-100 text-green-800" },
    rejected: { label: "Refusé", className: "bg-red-100 text-red-800" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avis clients</h1>
        <p className="text-muted-foreground">Modérez les avis avant publication</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approuvés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{reviews?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{avgRating}</p>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les avis</CardTitle>
          <CardDescription>{reviews?.length || 0} avis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => {
                  const status = statusConfig[review.status] || statusConfig.pending
                  const product = review.products as any
                  const client = review.profiles as any

                  return (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{product?.name || "—"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{client?.first_name} {client?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{client?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {review.comment || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(review.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ReviewActions review={review} />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun avis pour le moment
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