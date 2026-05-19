import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  boutique: [
    { name: "Robes", href: "/catalogue?category=robes" },
    { name: "Ensembles", href: "/catalogue?category=ensembles" },
    { name: "Accessoires", href: "/catalogue?category=accessoires" },
    { name: "Hommes", href: "/catalogue?category=hommes" },
    { name: "Mariage", href: "/catalogue?category=mariage" },
  ],
  services: [
    { name: "Consultation Personnalisée", href: "/consultation" },
    { name: "Sur Mesure", href: "/sur-mesure" },
    { name: "Programme Fidélité", href: "/fidelite" },
    { name: "Carte Cadeau", href: "/carte-cadeau" },
  ],
  aide: [
    { name: "FAQ", href: "/faq" },
    { name: "Livraison", href: "/livraison" },
    { name: "Retours", href: "/retours" },
    { name: "Guide des Tailles", href: "/guide-tailles" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Mentions Légales", href: "/mentions-legales" },
    { name: "CGV", href: "/cgv" },
    { name: "Politique de Confidentialité", href: "/confidentialite" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-sidebar-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Rejoignez la communauté Nella@House</h3>
            <p className="text-sidebar-foreground/70 mb-6">
              Inscrivez-vous pour recevoir nos offres exclusives et découvrir nos nouvelles collections en avant-première.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
              <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                S'inscrire
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">
                Nella<span className="text-sidebar-primary">@House</span>
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm mb-4">
              Mode africaine authentique et contemporaine. Célébrez votre héritage avec élégance.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-sidebar-accent rounded-full flex items-center justify-center hover:bg-sidebar-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-sidebar-accent rounded-full flex items-center justify-center hover:bg-sidebar-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-sidebar-accent rounded-full flex items-center justify-center hover:bg-sidebar-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-primary">Boutique</h4>
            <ul className="space-y-2">
              {footerLinks.boutique.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-primary">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-primary">Aide</h4>
            <ul className="space-y-2">
              {footerLinks.aide.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-sidebar-primary">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>123 Rue de la Mode, 75001 Paris</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>nellahouseconsulting@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-sidebar-foreground/70">
              © 2025 Nella@House Consulting. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}