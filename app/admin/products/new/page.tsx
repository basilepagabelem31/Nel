// Chemin : app/admin/products/new/page.tsx

import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

export const metadata = {
  title: "Nouveau produit",
}

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Nouveau produit</h1>
        <p className="text-muted-foreground">Ajoutez un produit à votre catalogue</p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}