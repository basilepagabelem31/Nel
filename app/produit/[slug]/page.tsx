import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from("products")
    .select("name, description, meta_title, meta_description")
    .eq("slug", slug)
    .single()

  if (!product) {
    return { title: "Produit non trouve" }
  }

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (id, name, slug),
      product_images (id, url, alt_text, is_primary, sort_order),
      product_variants (id, color, size, additional_price, stock_quantity, sku_variant)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!product) {
    notFound()
  }

  // Get related products
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
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("status", "published")
    .limit(4)

  // Sort images by sort_order
  const sortedImages = product.product_images?.sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  ) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground">Accueil</a>
              <span className="mx-2">/</span>
              <a href="/catalogue" className="hover:text-foreground">Catalogue</a>
              {product.categories && (
                <>
                  <span className="mx-2">/</span>
                  <a href={`/catalogue?category=${product.categories.slug}`} className="hover:text-foreground">
                    {product.categories.name}
                  </a>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <ProductGallery images={sortedImages} productName={product.name} />
              <ProductInfo product={product} />
            </div>
          </div>
        </section>

        {/* Product Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>
      <Footer />
    </div>
  )
}
