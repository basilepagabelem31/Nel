// Chemin : app/admin/products/page.tsx
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ProductActions } from "@/components/admin/product-actions"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = {
  title: "Gestion des Produits",
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      discount_price,
      stock_quantity,
      status,
      sku,
      created_at,
      categories (name)
    `)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>
      case "archived":
        return <Badge variant="secondary">Archivé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStockDisplay = (stock: number) => {
    if (stock > 10) {
      return <span className="text-green-600 font-medium">{stock}</span>
    } else if (stock > 0) {
      return <span className="text-amber-600 font-medium">{stock}</span>
    } else {
      return <span className="text-red-600 font-medium">Rupture</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un produit..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filtrer</Button>
              <Button variant="outline">Exporter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>{products?.length || 0} produits au total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      {product.categories?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {product.discount_price ? (
                        <div>
                          <span className="font-medium text-primary">
                            {Number(product.discount_price).toFixed(2)} €
                          </span>
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {Number(product.base_price).toFixed(2)} €
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">{Number(product.base_price).toFixed(2)} €</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStockDisplay(product.stock_quantity)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActions 
                        productId={product.id} 
                        slug={product.slug} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun produit trouvé
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