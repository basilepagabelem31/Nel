// Chemin : app/dashboard/favorites/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { addToCart } from "@/lib/actions/cart"
import { toggleFavorite } from "@/lib/actions/favorites"

import { toast } from "sonner"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("favorites")
      .select(`
        id,
        created_at,
        products (
          id,
          name,
          slug,
          base_price,
          discount_price,
          stock_quantity,
          product_images (url, alt_text, is_primary)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setFavorites(data || [])
    setLoading(false)
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingIds(prev => new Set(prev).add(productId))
    const result = await addToCart(productId, 1)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${productName} ajouté au panier !`)
    }
    
    setAddingIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mes favoris</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-t-xl" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }



  const handleRemoveFavorite = async (favoriteId: string, productId: string, productName: string) => {
  const result = await toggleFavorite(productId)
  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success(`${productName} retiré des favoris`)
    // Recharger la liste
    loadFavorites()
  }
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes favoris</h1>
        <p className="text-muted-foreground">
          {favorites?.length || 0} article{(favorites?.length || 0) > 1 ? "s" : ""} dans vos favoris
        </p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite: any) => {
            const product = favorite.products
            if (!product) return null

            const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]
            const hasDiscount = product.discount_price && product.discount_price < product.base_price
            const isInStock = product.stock_quantity > 0
            const isAdding = addingIds.has(product.id)

            return (
              <Card key={favorite.id} className="group overflow-hidden">
                <div className="relative aspect-[3/4]">
                  <Link href={`/produit/${product.slug}`}>
                    <Image
                      src={primaryImage?.url || "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop"}
                      alt={primaryImage?.alt_text || product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </Link>
                  
                  {!isInStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
                        Rupture de stock
                      </span>
                    </div>
                  )}

<Button
  size="icon"
  variant="secondary"
  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
  onClick={() => handleRemoveFavorite(favorite.id, product.id, product.name)}
>
  <Trash2 className="h-4 w-4 text-destructive" />
</Button>
                </div>

                <CardContent className="p-4">
                  <Link href={`/produit/${product.slug}`}>
                    <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="font-bold text-primary">{product.discount_price.toFixed(2)} EUR</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.base_price.toFixed(2)} EUR
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">{product.base_price.toFixed(2)} EUR</span>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4 gap-2" 
                    disabled={!isInStock || isAdding}
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isAdding ? "Ajout..." : (isInStock ? "Ajouter au panier" : "Indisponible")}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez des articles à vos favoris pour les retrouver facilement
            </p>
            <Link href="/catalogue">
              <Button>Découvrir la boutique</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}