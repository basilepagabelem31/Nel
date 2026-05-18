import { Truck, Shield, RotateCcw, Headphones } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Livraison Gratuite",
    description: "A partir de 150EUR d'achat en France metropolitaine",
  },
  {
    icon: Shield,
    title: "Paiement Securise",
    description: "Transactions 100% securisees avec Stripe",
  },
  {
    icon: RotateCcw,
    title: "Retours Faciles",
    description: "30 jours pour changer d'avis",
  },
  {
    icon: Headphones,
    title: "Support Client",
    description: "Equipe disponible 7j/7 pour vous aider",
  },
]

export function TrustBadges() {
  return (
    <section className="py-16 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
