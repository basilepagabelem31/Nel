// Chemin : components/checkout/checkout-form.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, Smartphone, Building2, Wallet, Truck, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createPendingOrder, createOrderDirect } from "@/lib/actions/orders"
import { toast } from "sonner"

interface CheckoutFormProps {
  cartItems: any[]
  addresses: any[]
  profile: any
  userId: string
  cartId: string
  subtotal: number
}

interface PaymentOption {
  value: string
  label: string
  icon: any
  description: string
  recommended?: boolean
  demo?: boolean
  disabled?: boolean
}

export function CheckoutForm({ cartItems, addresses, profile, userId, cartId, subtotal }: CheckoutFormProps) {
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find(a => a.is_default)?.id || addresses[0]?.id || ""
  )
  const [paymentMethod, setPaymentMethod] = useState<string>("cash_on_delivery")
  const [notes, setNotes] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [loading, setLoading] = useState(false)

  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  // Paiement à la livraison
  const handleCashOnDelivery = async () => {
    const result = await createOrderDirect({
      addressId: selectedAddress,
      cartId,
      promoCode: promoCode || undefined,
      notes: notes || undefined,
      paymentMethod: "cash_on_delivery",
    })

    if (result.error) {
      toast.error(result.error)
      return false
    }
    return true
  }

  // Paiement Stripe (démo)
  const handleStripePayment = async () => {
    const { orderId, orderNumber, totalAmount, items } = await createPendingOrder({
      addressId: selectedAddress,
      cartId,
      promoCode: promoCode || undefined,
      notes: notes || undefined,
    })

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        orderNumber,
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount,
        email: profile.email,
      }),
    })

    const { url, error } = await response.json()
    if (error) throw new Error(error)
    
    window.location.href = url
    return true
  }

  const handleSubmit = async () => {
    if (!selectedAddress && addresses.length > 0) {
      toast.error("Veuillez sélectionner une adresse de livraison")
      return
    }

    setLoading(true)

    try {
      let success = false
      
      if (paymentMethod === "stripe") {
        success = await handleStripePayment()
      } else if (paymentMethod === "cash_on_delivery") {
        success = await handleCashOnDelivery()
      }

      if (success) {
        toast.success("Commande confirmée !")
        router.push("/dashboard/orders")
      }
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions: PaymentOption[] = [
    { 
      value: "cash_on_delivery", 
      label: "Paiement à la livraison", 
      icon: Truck, 
      description: "Payez à la réception de votre commande",
      recommended: true
    },
    { 
      value: "stripe", 
      label: "Carte bancaire (Démo)", 
      icon: CreditCard, 
      description: "Visa, Mastercard - Mode test",
      demo: true
    },
    { value: "paypal", label: "PayPal", icon: Wallet, description: "Paiement via votre compte PayPal", disabled: true },
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone, description: "Orange Money, Wave, MTN...", disabled: true },
    { value: "bank_transfer", label: "Virement bancaire", icon: Landmark, description: "Traitement sous 2-3 jours", disabled: true },
  ]

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
              onValueChange={(v) => setPaymentMethod(v)}
              className="space-y-3"
            >
              {paymentOptions.map((option) => (
                <div 
                  key={option.value} 
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-all
                    ${option.disabled ? 'opacity-50 cursor-not-allowed bg-muted/20' : 'hover:bg-muted/30 cursor-pointer'}
                    ${option.recommended ? 'border-primary/50 bg-primary/5' : ''}
                  `}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value} 
                    disabled={option.disabled}
                    className={option.disabled ? 'opacity-50' : ''}
                  />
                  <Label 
                    htmlFor={option.value} 
                    className={`cursor-pointer flex items-center gap-3 flex-1 ${option.disabled ? 'cursor-not-allowed' : ''}`}
                  >
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {option.label}
                        {option.recommended && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                            Recommandé
                          </Badge>
                        )}
                        {option.demo && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Démo
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {paymentMethod === "stripe" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  💳 Mode démo — Utilisez la carte <strong>4242 4242 4242 4242</strong>
                </p>
              </div>
            )}

            {paymentMethod === "cash_on_delivery" && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  🚚 Paiement à la livraison — Vous payez à la réception de votre colis
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
                    <p className="text-sm font-medium">{(Number(price) * item.quantity).toFixed(2)} €</p>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} €`}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || (addresses.length > 0 && !selectedAddress)}
            >
              {loading ? "Traitement en cours..." : "Confirmer la commande"}
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