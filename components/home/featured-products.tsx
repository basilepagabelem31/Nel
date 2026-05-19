// Chemin : components/home/featured-products.tsx
import Link from "next/link"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeaturedProductCardClient } from "./featured-product-card-client"
import { FavoriteButton } from "@/components/ui/favorite-button"


interface Product {
  id: string
  name: string
  slug: string
  base_price: number
  discount_price: number | null
  is_featured: boolean
  origin_country: string
  product_images: { url: string; alt_text: string }[]
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Pièces Vedettes</h2>
            <p className="text-muted-foreground">
              Notre sélection des plus belles créations africaines
            </p>
          </div>
          <Link href="/catalogue?featured=true">
            <Button variant="outline">Voir toutes les vedettes</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discount_price && product.discount_price < product.base_price
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.discount_price!) / product.base_price) * 100)
    : 0

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-secondary/50 aspect-[3/4] mb-4">
        <Link href={`/produit/${product.slug}`}>
          <Image
            src={product.product_images?.[0]?.url || "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop"}
            alt={product.product_images?.[0]?.alt_text || product.name}
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
  <FavoriteButton productId={product.id} />
</div>

        {/* Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <FeaturedProductCardClient 
            productId={product.id} 
            productName={product.name}
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">{product.origin_country}</p>
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