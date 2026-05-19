"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree,
  MessageSquare,
  Settings,
  BarChart3,
  Tag,
  LogOut,
  Gift,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminSidebarProps {
  userRole?: string
}

export function AdminSidebar({ userRole = "admin" }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isGestionnaire = userRole === "gestionnaire"
  const isAdmin = userRole === "admin"

  // Navigation avec permissions par rôle
  const allNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, allowed: ["admin", "gestionnaire"] },
    { name: "Produits", href: "/admin/products", icon: Package, allowed: ["admin", "gestionnaire"] },
    { name: "Catégories", href: "/admin/categories", icon: FolderTree, allowed: ["admin", "gestionnaire"] },
    { name: "Commandes", href: "/admin/orders", icon: ShoppingCart, allowed: ["admin", "gestionnaire"] },
    { name: "Consultations", href: "/admin/consultations", icon: MessageSquare, allowed: ["admin", "gestionnaire"] },
    { name: "Codes Promo", href: "/admin/promo-codes", icon: Tag, allowed: ["admin", "gestionnaire"] },
    { name: "Avis", href: "/admin/reviews", icon: Star, allowed: ["admin", "gestionnaire"] },
    { name: "Statistiques", href: "/admin/analytics", icon: BarChart3, allowed: ["admin", "gestionnaire"] },
    { name: "Users", href: "/admin/users", icon: Users, allowed: ["admin"] }, // Seul admin
    { name: "Fidélité", href: "/admin/loyalty", icon: Gift, allowed: ["admin", "gestionnaire"] },
    { name: "Paramètres", href: "/admin/settings", icon: Settings, allowed: ["admin"] },
  ]

  const navigation = allNavigation.filter(item => item.allowed.includes(userRole))

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Label du rôle en français
  const roleLabel = userRole === "admin" ? "Administrateur" : "Gestionnaire"

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">N</span>
            </div>
            <div>
              <span className="font-bold text-lg">Nella@House</span>
              <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Link href="/" className="block mb-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              Voir la boutique
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-red-400"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  )
}