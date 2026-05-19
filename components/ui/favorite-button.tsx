// Chemin : components/ui/favorite-button.tsx
"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleFavorite, isFavorite as checkIsFavorite } from "@/lib/actions/favorites"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      const status = await checkIsFavorite(productId)
      setIsFavorite(status)
    }
    loadFavoriteStatus()
  }, [productId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    const result = await toggleFavorite(productId)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      setIsFavorite(result.isFavorite)
      toast.success(result.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris")
    }
    setIsLoading(false)
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      className={cn("h-8 w-8 rounded-full shadow-md", className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
      <span className="sr-only">
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  )
}