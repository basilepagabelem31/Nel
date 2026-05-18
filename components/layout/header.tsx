"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingBag, User, Menu, Heart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Catalogue", href: "/catalogue" },
  { name: "Robes", href: "/catalogue?category=robes" },
  { name: "Ensembles", href: "/catalogue?category=ensembles" },
  { name: "Accessoires", href: "/catalogue?category=accessoires" },
  { name: "Mariage", href: "/catalogue?category=mariage" },
  { name: "Consultation", href: "/consultation" },
]

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-border/50">
          <p className="text-muted-foreground">
            Livraison disponible | nellahouseconsulting@gmail.com
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                Déconnexion
              </button>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                <Link 
                  href="/" 
                  className="text-2xl font-bold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nella@House
                </Link>
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link href="/about" className="text-lg text-foreground hover:text-primary transition-colors py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>À propos</Link>
                  <Link href="/contact" className="text-lg text-foreground hover:text-primary transition-colors py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                </nav>
                <div className="flex flex-col gap-3 mt-4">
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Mon Compte</Button>
                      </Link>
                      <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}>
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Connexion</Button>
                      </Link>
                      <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Créer un compte</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-foreground">
              Nella<span className="text-primary">@House</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/dashboard/favorites">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favoris</span>
                </Button>
              </Link>
            )}
            
            <Link href="/panier">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Panier</span>
              </Button>
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Mon Compte</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 text-muted-foreground hover:text-destructive hidden md:flex"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <Button size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Connexion</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}