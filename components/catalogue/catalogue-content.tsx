import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/server"

interface CatalogueContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function CatalogueContent({ searchParams }: CatalogueContentProps) {
  const supabase = await createClient()
  
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const minPrice = typeof searchParams.minPrice === "string" ? parseInt(searchParams.minPrice) : undefined
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseInt(searchParams.maxPrice) : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest"
  const featured = searchParams.featured === "true"

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      discount_price,
      is_featured,
      origin_country,
      categories!inner (slug, name),
      product_images (url, alt_text, is_primary)
    `)
    .eq("status", "published")

  if (category) {
    query = query.eq("categories.slug", category)
  }

  if (minPrice) {
    query = query.gte("base_price", minPrice)
  }

  if (maxPrice) {
    query = query.lte("base_price", maxPrice)
  }

  if (featured) {
    query = query.eq("is_featured", true)
  }

  // Sorting
  switch (sort) {
    case "price-asc":
      query = query.order("base_price", { ascending: true })
      break
    case "price-desc":
      query = query.order("base_price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">
          {products?.length || 0} produit{(products?.length || 0) > 1 ? "s" : ""} trouve{(products?.length || 0) > 1 ? "s" : ""}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trier par:</span>
          <Select defaultValue={sort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus recents</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix decroissant</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Aucun produit trouve</p>
          <Link href="/catalogue">
            <Button variant="outline">Voir tous les produits</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const hasDiscount = product.discount_price && product.discount_price < product.base_price
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0

  const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-secondary/50 aspect-[3/4] mb-4">
        <Link href={`/produit/${product.slug}`}>
          <Image
            src={primaryImage?.url || "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop"}
            alt={primaryImage?.alt_text || product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <Badge className="bg-accent text-accent-foreground">
              <Star className="h-3 w-3 mr-1" />
              Vedette
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Ajouter aux favoris</span>
          </Button>
        </div>

        {/* Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button className="w-full gap-2 shadow-md">
            <ShoppingBag className="h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {product.categories?.name || product.origin_country}
        </p>
        <Link href={`/produit/${product.slug}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-primary">{product.discount_price?.toFixed(2)} EUR</span>
              <span className="text-sm text-muted-foreground line-through">{product.base_price.toFixed(2)} EUR</span>
            </>
          ) : (
            <span className="font-bold text-foreground">{product.base_price.toFixed(2)} EUR</span>
          )}
        </div>
      </div>
    </div>
  )
}
