import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/home/hero"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { ConsultationBanner } from "@/components/home/consultation-banner"
import { TrustBadges } from "@/components/home/trust-badges"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      discount_price,
      is_featured,
      origin_country,
      product_images (url, alt_text)
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(8)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <CategoriesSection />
        <FeaturedProducts products={featuredProducts || []} />
        <ConsultationBanner />
      </main>
      <Footer />
    </div>
  )
}
