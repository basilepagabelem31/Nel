"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, Minus, Plus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ProductInfoProps {
  product: {
    id: string
    name: string
    description: string
    base_price: number
    discount_price: number | null
    stock_quantity: number
    origin_country: string
    composition: string
    is_featured: boolean
    tags: string[]
    categories: { name: string } | null
    product_variants: {
      id: string
      color: string
      size: string
      additional_price: number
      stock_quantity: number
    }[]
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const hasDiscount = product.discount_price && product.discount_price < product.base_price
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.discount_price!) / product.base_price) * 100)
    : 0

  // Get unique colors and sizes
  const colors = [...new Set(product.product_variants?.map((v) => v.color).filter(Boolean))]
  const sizes = [...new Set(product.product_variants?.map((v) => v.size).filter(Boolean))]

  const selectedVariant = product.product_variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  )

  const finalPrice = hasDiscount 
    ? product.discount_price! + (selectedVariant?.additional_price || 0)
    : product.base_price + (selectedVariant?.additional_price || 0)

  const isInStock = product.stock_quantity > 0 || (selectedVariant?.stock_quantity || 0) > 0

  return (
    <div className="space-y-6">
      {/* Category & Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.categories && (
          <Badge variant="secondary">{product.categories.name}</Badge>
        )}
        {product.is_featured && (
          <Badge className="bg-accent text-accent-foreground">Vedette</Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive">-{discountPercent}%</Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-muted-foreground">Origine: {product.origin_country}</p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-primary">
          {finalPrice.toFixed(2)} EUR
        </span>
        {hasDiscount && (
          <span className="text-xl text-muted-foreground line-through">
            {product.base_price.toFixed(2)} EUR
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "w-2 h-2 rounded-full",
          isInStock ? "bg-green-500" : "bg-red-500"
        )} />
        <span className={cn(
          "text-sm",
          isInStock ? "text-green-600" : "text-red-600"
        )}>
          {isInStock ? "En stock" : "Rupture de stock"}
        </span>
      </div>

      <Separator />

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <Label className="text-base mb-3 block">Couleur</Label>
          <RadioGroup
            value={selectedColor || ""}
            onValueChange={setSelectedColor}
            className="flex flex-wrap gap-3"
          >
            {colors.map((color) => (
              <div key={color}>
                <RadioGroupItem
                  value={color}
                  id={`color-${color}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`color-${color}`}
                  className={cn(
                    "px-4 py-2 border rounded-lg cursor-pointer transition-colors",
                    "hover:border-primary peer-data-[state=checked]:border-primary",
                    "peer-data-[state=checked]:bg-primary/10"
                  )}
                >
                  {color}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Taille</Label>
            <button className="text-sm text-primary hover:underline">
              Guide des tailles
            </button>
          </div>
          <RadioGroup
            value={selectedSize || ""}
            onValueChange={setSelectedSize}
            className="flex flex-wrap gap-3"
          >
            {sizes.map((size) => (
              <div key={size}>
                <RadioGroupItem
                  value={size}
                  id={`size-${size}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`size-${size}`}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center border rounded-lg cursor-pointer transition-colors",
                    "hover:border-primary peer-data-[state=checked]:border-primary",
                    "peer-data-[state=checked]:bg-primary/10 font-medium"
                  )}
                >
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="text-base mb-3 block">Quantite</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1 gap-2" disabled={!isInStock}>
          <ShoppingBag className="h-5 w-5" />
          Ajouter au panier
        </Button>
        <Button size="lg" variant="outline">
          <Heart className="h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Livraison gratuite des 150EUR</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Paiement securise</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Retours sous 30 jours</p>
        </div>
      </div>
    </div>
  )
}
