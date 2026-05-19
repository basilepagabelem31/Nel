// Chemin : app/about/page.tsx

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Heart, Star, Globe, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "À propos — Nella@House Consulting",
  description: "Valoriser les cultures africaines à travers les vêtements et tissus.",
}

const values = [
  {
    icon: Heart,
    title: "Authenticité culturelle",
    description: "Nous respectons et promouvons l'héritage vestimentaire africain dans chaque pièce de notre collection.",
  },
  {
    icon: Star,
    title: "Élégance & Qualité",
    description: "Des créations raffinées et modernes qui allient tradition et contemporain avec un soin du détail exceptionnel.",
  },
  {
    icon: Users,
    title: "Proximité client",
    description: "Un accompagnement chaleureux et personnalisé pour chaque client, de la sélection jusqu'à la livraison.",
  },
  {
    icon: Globe,
    title: "Fierté identitaire",
    description: "Nous renforçons le lien de nos clients à leur identité culturelle africaine, au-delà des frontières.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-secondary via-background to-accent/20 py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary-foreground font-bold text-3xl">N</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nella<span className="text-primary">@House</span> Consulting
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              « Valoriser les cultures africaines au-delà des frontières à travers les vêtements et tissus,
              et faire ressentir à chaque client un sentiment d'appartenance et une connexion à ses origines. »
            </p>
          </div>
        </section>

        {/* Notre histoire */}
        <section className="py-16 container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Notre histoire</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Nella@House Consulting est née d'une passion profonde pour la mode africaine et d'un désir de
                la partager avec le monde entier. Spécialisée dans la commercialisation de vêtements et de
                tissus africains, nous proposons nos produits à la fois en ligne et en présentiel sur commande.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Nous nous positionnons comme une marque de mode africaine moderne et accessible, alliant
                tradition, élégance et accompagnement personnalisé. Chaque tissu, chaque vêtement raconte
                une histoire — celle de l'Afrique dans toute sa diversité et sa beauté.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Contactez-nous à <a href="mailto:Ajouter au panier" className="text-primary hover:underline">Ajouter au panier</a> pour tout renseignement.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl p-8 text-center">
              <p className="text-6xl mb-4">🌍</p>
              <h3 className="text-xl font-bold mb-2">Mode africaine moderne</h3>
              <p className="text-muted-foreground">
                Soies, Bazin, Kente, Lace, Guipure, Pagne — une collection qui embrasse toute la richesse textile du continent.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {["Soies", "Bazin", "Kente", "Lace", "Guipure", "Pagne"].map((t) => (
                  <div key={t} className="bg-background rounded-lg px-3 py-2 font-medium">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos valeurs</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((v) => (
                <Card key={v.title}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <v.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Nos services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">🛍️ Catalogue textile</h3>
              <ul className="space-y-2 text-muted-foreground">
                {["Soies (plissée, teintée, simple)", "Lace (dentelle)", "Guipure", "Pagne africain", "Ensembles hommes (Goodlook, Super 100)", "Bazin", "Kente", "Prêt-à-porter"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">✨ Services personnalisés</h3>
              <ul className="space-y-2 text-muted-foreground">
                {["Conseil en style vestimentaire personnalisé", "Accompagnement pour anniversaires", "Conseil pour soirées et concerts", "Sélection pour mariages", "Recommandations pour cérémonies traditionnelles", "Réponse sous 24h par un conseiller dédié"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}