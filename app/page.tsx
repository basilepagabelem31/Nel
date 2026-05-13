import { createClient } from '@/lib/supabase/server'
import { Header, Footer } from '@/components/layout'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { ArtisansSection } from '@/components/home/artisans-section'
import { ValueProposition } from '@/components/home/value-proposition'
import { TestimonialsSection } from '@/components/home/testimonials-section'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('produits')
    .select(`
      *,
      categorie:categories(nom_fr, nom_en, slug),
      artisan:artisans(nom, pays)
    `)
    .eq('est_vedette', true)
    .eq('est_actif', true)
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('est_actif', true)
    .order('ordre', { ascending: true })
    .limit(6)

  // Fetch artisans
  const { data: artisans } = await supabase
    .from('artisans')
    .select('*')
    .eq('est_actif', true)
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ValueProposition />
        <CategoriesSection categories={categories || []} />
        <FeaturedProducts products={featuredProducts || []} />
        <ArtisansSection artisans={artisans || []} />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
