// Chemin : app/produit/[slug]/page.tsx
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import { createClient } from "@/lib/supabase/server"
import { isFavorite } from "@/lib/actions/favorites"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from("products")
    .select("name, meta_title, meta_description")
    .eq("slug", slug)
    .single()

  return {
    title: product?.meta_title || product?.name || "Produit",
    description: product?.meta_description || "",
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (name),
      product_images (id, url, alt_text, is_primary, sort_order),
      product_variants (id, color, size, additional_price, stock_quantity)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !product) {
    notFound()
  }

  // Récupérer l'état favori
  const favoriteStatus = await isFavorite(product.id)

  // Récupérer les produits similaires
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      discount_price,
      origin_country,
      product_images (url, alt_text, is_primary)
    `)
    .eq("status", "published")
    .neq("id", product.id)
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ProductGallery images={product.product_images || []} productName={product.name} />
            <ProductInfo product={product} initialIsFavorite={favoriteStatus} />
          </div>
        </div>
        <ProductTabs product={product} />
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>
      <Footer />
    </div>
  )
}