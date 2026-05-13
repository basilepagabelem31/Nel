import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerLinks = {
  shop: [
    { name: 'footer.newArrivals', href: '/boutique?filter=nouveautes' },
    { name: 'footer.bestSellers', href: '/boutique?filter=meilleures-ventes' },
    { name: 'footer.promotions', href: '/boutique?filter=promotions' },
    { name: 'footer.allProducts', href: '/boutique' },
  ],
  categories: [
    { name: 'categories.dresses', href: '/categories/robes' },
    { name: 'categories.shirts', href: '/categories/chemises-tops' },
    { name: 'categories.accessories', href: '/categories/accessoires' },
    { name: 'categories.jewelry', href: '/categories/bijoux' },
  ],
  info: [
    { name: 'footer.about', href: '/a-propos' },
    { name: 'footer.artisans', href: '/artisans' },
    { name: 'footer.styleConsulting', href: '/consultation-style' },
    { name: 'footer.contact', href: '/contact' },
  ],
  legal: [
    { name: 'footer.shipping', href: '/livraison' },
    { name: 'footer.returns', href: '/retours' },
    { name: 'footer.privacy', href: '/confidentialite' },
    { name: 'footer.terms', href: '/cgv' },
  ],
}

export function Footer() {
  const t = useTranslations()

  return (
    <footer className="border-t border-border bg-secondary/30">
      {/* Newsletter section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              {t('footer.newsletterTitle')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t('footer.newsletterDescription')}
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 bg-background"
                required
              />
              <Button type="submit" className="sm:w-auto">
                {t('footer.subscribe')}
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              {t('footer.promoCode')}
            </p>
          </div>
        </div>
      </div>

      {/* Links section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t('footer.shopTitle')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t('footer.categoriesTitle')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t('footer.infoTitle')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {t('footer.legalTitle')}
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Logo and copyright */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <span className="text-xl font-bold tracking-tight">
                Nella<span className="text-primary">@</span>House
              </span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Nella@House Consulting. {t('footer.rights')}
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
