// Chemin : app/admin/products/[id]/edit/page.tsx

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Modifier le produit",
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  
  console.log("🔍 [EditProductPage] ID reçu:", id)
  
  // Vérifier si l'ID est valide
  if (!id || id === "undefined" || id === "null") {
    console.log("❌ [EditProductPage] ID invalide")
    return notFound()
  }
  
  const supabase = await createClient()

  // Récupérer le produit séparément pour mieux debug
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      product_images (*),
      product_variants (*)
    `)
    .eq("id", id)
    .single()

  if (productError) {
    console.log("❌ [EditProductPage] Erreur produit:", productError.message)
    console.log("🔍 [EditProductPage] ID recherché:", id)
    return notFound()
  }

  if (!product) {
    console.log("❌ [EditProductPage] Produit non trouvé pour ID:", id)
    return notFound()
  }

  console.log("✅ [EditProductPage] Produit trouvé:", product.name)

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Modifier le produit</h1>
          <p className="text-muted-foreground text-sm">{product.name}</p>
        </div>
      </div>

      <ProductForm categories={categories || []} product={product} />
    </div>
  )
}