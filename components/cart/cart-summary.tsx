// Chemin : components/cart/cart-summary.tsx
"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Tag, ArrowRight, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface CartSummaryProps {
  subtotal: number
  shipping: number
  total: number
  shippingFree: boolean
  itemCount: number
  isAuthenticated: boolean
}

export function CartSummary({
  subtotal,
  shipping,
  total,
  shippingFree,
  itemCount,
  isAuthenticated,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("")

  const handlePromoCode = () => {
    if (!promoCode.trim()) return
    toast.info("Le code promo sera appliqué lors de la commande")
  }

  return (
    <div className="space-y-4">
      {/* Code promo */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Code promotionnel
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="AFRICAN20"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button variant="outline" onClick={handlePromoCode}>Appliquer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})</span>
            <span>{subtotal.toFixed(2)} EUR</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              Livraison
            </span>
            <span className={shippingFree ? "text-green-600 font-medium" : ""}>
              {shippingFree ? "Gratuite" : `${shipping.toFixed(2)} EUR`}
            </span>
          </div>

          {!shippingFree && (
            <p className="text-xs text-muted-foreground">
              Livraison gratuite à partir de 100 EUR d'achat
            </p>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)} EUR</span>
          </div>

          {isAuthenticated ? (
            <Link href="/commande" className="block">
              <Button className="w-full gap-2" size="lg">
                Passer la commande
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login?redirect=/commande" className="block">
                <Button className="w-full" size="lg">
                  Se connecter pour commander
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Pas de compte ?{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Garanties */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-medium">Paiement sécurisé</p>
              <p className="text-xs text-muted-foreground">SSL & 3D Secure</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-xl">↩️</span>
            <div>
              <p className="font-medium">Retours faciles</p>
              <p className="text-xs text-muted-foreground">Sous 14 jours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}