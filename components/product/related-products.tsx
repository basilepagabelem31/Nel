import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface RelatedProductsProps {
  products: {
    id: string
    name: string
    slug: string
    base_price: number
    discount_price: number | null
    origin_country: string
    product_images: { url: string; alt_text: string; is_primary: boolean }[]
  }[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Vous aimerez aussi</h2>
          <Link href="/catalogue">
            <Button variant="outline">Voir plus</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]
            const hasDiscount = product.discount_price && product.discount_price < product.base_price

            return (
              <Link key={product.id} href={`/produit/${product.slug}`} className="group">
                <div className="relative aspect-[3/4] bg-secondary/50 rounded-xl overflow-hidden mb-3">
                  <Image
                    src={primaryImage?.url || "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop"}
                    alt={primaryImage?.alt_text || product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {hasDiscount ? (
                    <>
                      <span className="font-bold text-primary text-sm">{product.discount_price?.toFixed(2)} EUR</span>
                      <span className="text-xs text-muted-foreground line-through">{product.base_price.toFixed(2)} EUR</span>
                    </>
                  ) : (
                    <span className="font-bold text-sm">{product.base_price.toFixed(2)} EUR</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
