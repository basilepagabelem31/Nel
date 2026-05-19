"use client"

import Link from "next/link"
import { Menu, Bell, ShoppingBag, Shield } from "lucide-react" // Ajout de Shield
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardMobileNav } from "./dashboard-mobile-nav"
import { useCart } from "@/lib/context/cart-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface DashboardHeaderProps {
  user: User
  profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    loyalty_points: number
    role?: string  // Ajout du rôle
  } | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const { cartCount, refreshCart } = useCart()
  const [notificationCount, setNotificationCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(profile?.role || null)

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || "U"

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user.email

  // Récupérer les notifications non lues
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", false)
      
      setNotificationCount(data?.length || 0)
    }

    fetchNotifications()
    
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Rafraîchir le panier au montage
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Récupérer le rôle si pas dans profile
  useEffect(() => {
    if (!userRole && user) {
      const fetchRole = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        setUserRole(data?.role || null)
      }
      fetchRole()
    }
  }, [user, userRole])

  const isAdmin = userRole === "admin" || userRole === "gestionnaire"

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <DashboardMobileNav />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold">N</span>
          </div>
          <span className="font-bold hidden sm:inline">
            Nella<span className="text-primary">@House</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/catalogue">
            <Button variant="ghost" size="sm">
              Boutique
            </Button>
          </Link>

          {/* 🔥 NOUVEAU : Bouton Admin (visible seulement pour admin/gestionnaire) */}
          {isAdmin && (
            <Link href="/admin">
              <Button variant="default" size="sm" className="gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90">
                <Shield className="h-4 w-4" />
                Administration
              </Button>
            </Link>
          )}

          {/* Notifications */}
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Panier */}
          <Link href="/panier">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium max-w-[150px] truncate">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile?.loyalty_points || 0} points fidélité
                  </span>
                  {isAdmin && (
                    <span className="text-xs font-medium text-primary mt-1">
                      {userRole === "admin" ? "Administrateur" : "Gestionnaire"}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* 🔥 NOUVEAU : Lien admin dans le menu déroulant aussi */}
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Tableau de bord</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/orders">Mes commandes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/favorites">Mes favoris</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Mon profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/addresses">Mes adresses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/consultations">Mes consultations</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/loyalty">Programme fidélité</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.href = "/"
                }}
              >
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}