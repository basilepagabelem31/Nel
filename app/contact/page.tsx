// Chemin : app/contact/page.tsx

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Mail, Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Contact — Nella@House Consulting",
  description: "Contactez-nous pour toute question sur nos vêtements africains.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-secondary via-background to-accent/20 py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contactez<span className="text-primary">-nous</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Une question, une commande sur mesure, ou simplement envie d'en savoir plus ?
              Notre équipe vous répond sous 24h.
            </p>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Nos coordonnées</h2>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:nellahouseconsulting@gmail.com"
                      className="text-primary hover:underline break-all"
                    >
                      nellahouseconsulting@gmail.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">Réponse sous 24h</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horaires de disponibilité</h3>
                    <p className="text-muted-foreground text-sm">Lundi – Vendredi : 9h – 18h</p>
                    <p className="text-muted-foreground text-sm">Samedi : 10h – 15h</p>
                    <p className="text-muted-foreground text-sm">Dimanche : Fermé</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Facebook className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Réseaux sociaux</h3>
                    <a
                      href="https://www.facebook.com/profile.php?id=61569382314077"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Facebook — NellaHouse Consulting
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">
                      Suivez-nous pour les nouveautés et promotions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="prenom">Prénom</label>
                      <input
                        id="prenom"
                        type="text"
                        placeholder="Votre prénom"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="nom">Nom</label>
                      <input
                        id="nom"
                        type="text"
                        placeholder="Votre nom"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="sujet">Sujet</label>
                    <select
                      id="sujet"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="commande">Suivi de commande</option>
                      <option value="produit">Question produit</option>
                      <option value="consultation">Demande de consultation</option>
                      <option value="retour">Retour / Remboursement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Décrivez votre demande..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                    />
                  </div>

                  <a
                    href={`mailto:nellahouseconsulting@gmail.com?subject=Contact depuis le site`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Envoyer par email
                  </a>

                  <p className="text-xs text-muted-foreground text-center">
                    Ce formulaire ouvre votre client mail. Vous pouvez aussi nous écrire directement à{" "}
                    <a href="mailto:nellahouseconsulting@gmail.com" className="text-primary hover:underline">
                      nellahouseconsulting@gmail.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}