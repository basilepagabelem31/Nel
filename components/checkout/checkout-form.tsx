// Chemin : components/checkout/checkout-form.tsx
"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { CreditCard, Smartphone, Building2, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createOrder } from "@/lib/actions/orders"
import { toast } from "sonner"

interface CheckoutFormProps {
  cartItems: any[]
  addresses: any[]
  profile: any
  userId: string
  cartId: string
  subtotal: number
}

export function CheckoutForm({ cartItems, addresses, profile, userId, cartId, subtotal }: CheckoutFormProps) {
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find(a => a.is_default)?.id || addresses[0]?.id || ""
  )
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | "mobile_money" | "bank_transfer">("stripe")
  const [notes, setNotes] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [isPending, startTransition] = useTransition()

  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  const handleSubmit = () => {
    if (!selectedAddress && addresses.length > 0) {
      toast.error("Veuillez sélectionner une adresse de livraison")
      return
    }

    startTransition(async () => {
      const result = await createOrder({
        addressId: selectedAddress,
        cartId,
        promoCode: promoCode || undefined,
        notes: notes || undefined,
        paymentMethod,
      })

      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  const paymentOptions = [
    { value: "stripe", label: "Carte bancaire", icon: CreditCard, description: "Visa, Mastercard, etc." },
    { value: "paypal", label: "PayPal", icon: Wallet, description: "Paiement via votre compte PayPal" },
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone, description: "Orange Money, Wave, MTN..." },
    { value: "bank_transfer", label: "Virement bancaire", icon: Building2, description: "Traitement sous 2-3 jours" },
  ] as const

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length > 0 ? (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <Label htmlFor={address.id} className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {address.label && <span className="font-medium">{address.label}</span>}
                        {address.is_default && <Badge variant="secondary" className="text-xs">Défaut</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.street}, {address.city}
                        {address.state && `, ${address.state}`}
                        {address.zip_code && ` ${address.zip_code}`}
                        {" — "}{address.country}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Aucune adresse enregistrée</p>
                <Button variant="outline" asChild>
                  <a href="/dashboard/addresses">Ajouter une adresse</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Mode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as any)}
              className="space-y-3"
            >
              {paymentOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex items-center gap-3 flex-1">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {paymentMethod === "stripe" && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  🔒 Paiement sécurisé — Vous serez redirigé vers Stripe pour finaliser le paiement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de livraison (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Instructions particulières, code d'entrée, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: Order summary */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Ma commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Articles */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const product = item.products
                const price = product?.discount_price || product?.base_price || 0
                const primaryImage = product?.product_images?.find((img: any) => img.is_primary) || product?.product_images?.[0]

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                      {primaryImage?.url && (
                        <Image src={primaryImage.url} alt={product?.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product?.name}</p>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{(Number(price) * item.quantity).toFixed(2)} EUR</p>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{subtotal.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} EUR`}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} EUR</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isPending || (addresses.length > 0 && !selectedAddress)}
            >
              {isPending ? "Traitement en cours..." : "Confirmer la commande"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              En confirmant, vous acceptez nos conditions générales de vente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}