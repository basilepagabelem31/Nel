// Chemin : components/cart/cart-items.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { removeFromCart, updateCartItemQuantity } from "@/lib/actions/cart"
import { useTransition } from "react"
import { toast } from "sonner"

interface CartItemsProps {
  items: any[]
}

export function CartItems({ items }: CartItemsProps) {
  const [isPending, startTransition] = useTransition()

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const result = await removeFromCart(itemId)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  const handleQuantity = (itemId: string, newQty: number) => {
    startTransition(async () => {
      const result = await updateCartItemQuantity(itemId, newQty)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const product = item.products
        const variant = item.product_variants
        const primaryImage = product?.product_images?.find((img: any) => img.is_primary) || product?.product_images?.[0]
        const price = product?.discount_price || product?.base_price || 0

        return (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-24 h-32 rounded-lg overflow-hidden shrink-0 bg-muted">
                  {primaryImage?.url ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt_text || product?.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      Photo
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/produit/${product?.slug}`}>
                    <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                      {product?.name}
                    </h3>
                  </Link>

                  {variant && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {variant.color && `Couleur: ${variant.color}`}
                      {variant.color && variant.size && " · "}
                      {variant.size && `Taille: ${variant.size}`}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        disabled={isPending || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        disabled={isPending || item.quantity >= (product?.stock_quantity || 99)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold">{(Number(price) * item.quantity).toFixed(2)} EUR</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">{Number(price).toFixed(2)} EUR / unité</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}