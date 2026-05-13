'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User, Search, Globe, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { useRouter, usePathname } from 'next/navigation'

const navigation = [
  { name: 'nav.shop', href: '/boutique' },
  { name: 'nav.categories', href: '/categories' },
  { name: 'nav.artisans', href: '/artisans' },
  { name: 'nav.styleConsulting', href: '/consultation-style' },
  { name: 'nav.about', href: '/a-propos' },
]

export function Header() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const switchLocale = (locale: string) => {
    router.push(pathname, { locale } as never)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top banner */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 text-center text-sm">
          {t('header.banner')}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {t(item.name)}
                  </Link>
                ))}
                <hr className="my-4" />
                <Link
                  href="/compte"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.account')}
                </Link>
                <Link
                  href="/favoris"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.favorites')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight lg:text-3xl">
              Nella<span className="text-primary">@</span>House
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary"
              >
                {t(item.name)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <Button variant="ghost" size="icon" aria-label={t('nav.search')}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.language')}>
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => switchLocale('fr')}>
                  Francais
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites - Hidden on mobile */}
            <Link href="/favoris" className="hidden lg:block">
              <Button variant="ghost" size="icon" aria-label={t('nav.favorites')}>
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Account */}
            <Link href="/compte" className="hidden lg:block">
              <Button variant="ghost" size="icon" aria-label={t('nav.account')}>
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/panier">
              <Button variant="ghost" size="icon" className="relative" aria-label={t('nav.cart')}>
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  0
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
