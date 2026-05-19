// Chemin : app/admin/categories/page.tsx

import { FolderTree } from "lucide-react"
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
import { createClient } from "@/lib/supabase/server"
import { CategoryActions } from "@/components/admin/category-actions"
import { AddCategoryDialog } from "@/components/admin/add-category-dialog"
import Link from "next/link"

export const metadata = {
  title: "Gestion des catégories",
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Récupérer toutes les catégories avec leur parent
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      parent:parent_id (name)
    `)
    .order("sort_order", { ascending: true })

  // Compter les produits par catégorie
  const { data: productCounts } = await supabase
    .from("products")
    .select("category_id")

  const countMap: Record<string, number> = {}
  if (productCounts) {
    for (const p of productCounts) {
      if (p.category_id) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">Gérez l'arborescence de votre catalogue</p>
        </div>
        <AddCategoryDialog categories={categories || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les catégories</CardTitle>
          <CardDescription>{categories?.length || 0} catégorie(s) au total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {cat.slug}
                    </TableCell>
                    <TableCell>
                      {cat.parent ? (
                        <Badge variant="outline">{cat.parent.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Racine</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{countMap[cat.id] || 0} produit(s)</Badge>
                    </TableCell>
                    <TableCell>{cat.sort_order}</TableCell>
                    <TableCell>
                      {cat.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryActions category={cat} allCategories={categories || []} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune catégorie. Cliquez sur "Nouvelle catégorie" pour commencer.
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