// Chemin : components/home/featured-product-card-client.tsx
"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/actions/cart"
import { toast } from "sonner"

interface FeaturedProductCardClientProps {
  productId: string
  productName: string
}

export function FeaturedProductCardClient({ productId, productName }: FeaturedProductCardClientProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAdding(true)
    const result = await addToCart(productId, 1)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${productName} ajouté au panier`)
    }
    setIsAdding(false)
  }

  return (
    <Button 
      className="w-full gap-2 shadow-md"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      <ShoppingBag className="h-4 w-4" />
      {isAdding ? "Ajout..." : "Ajouter au panier"}
    </Button>
  )
}