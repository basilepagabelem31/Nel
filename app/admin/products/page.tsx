import Link from "next/link"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Gestion des Produits",
}

export default async function AdminProductsPage() {
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
    categories (name)
  `)
  .order("created_at", { ascending: false }) as { data: Array<{
    id: string
    name: string
    slug: string
    base_price: number
    discount_price: number | null
    stock_quantity: number
    status: string
    sku: string
    categories: { name: string } | null
  }> | null }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publie</Badge>
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>
      case "archived":
        return <Badge variant="secondary">Archive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">Gerez votre catalogue de produits</p>
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
                <TableHead>Categorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      {product.categories?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {product.discount_price ? (
                        <div>
                          <span className="font-medium">{Number(product.discount_price).toFixed(2)} EUR</span>
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {Number(product.base_price).toFixed(2)} EUR
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">{Number(product.base_price).toFixed(2)} EUR</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={product.stock_quantity > 10 
                        ? "text-green-600" 
                        : product.stock_quantity > 0 
                          ? "text-amber-600" 
                          : "text-red-600"
                      }>
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/produit/${product.slug}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun produit trouve
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
