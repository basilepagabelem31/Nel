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
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Produits", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Commandes", href: "/admin/orders", icon: ShoppingCart },
  { name: "Clients", href: "/admin/users", icon: Users },
  { name: "Consultations", href: "/admin/consultations", icon: MessageSquare },
  { name: "Codes Promo", href: "/admin/promo-codes", icon: Tag },
  { name: "Statistiques", href: "/admin/analytics", icon: BarChart3 },
  { name: "Parametres", href: "/admin/settings", icon: Settings },
]

export function AdminMobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">N</span>
          </div>
          <div>
            <span className="font-bold text-lg">Nella@House</span>
            <p className="text-xs text-sidebar-foreground/60">Administration</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          Retour a la boutique
        </Link>
        
        <div className="h-px bg-sidebar-border my-2" />

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
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Deconnexion
        </Button>
      </div>
    </div>
  )
}
