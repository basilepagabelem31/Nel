"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  User, 
  MapPin, 
  Bell, 
  MessageSquare,
  Gift,
  LogOut,
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes commandes", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Mes favoris", href: "/dashboard/favorites", icon: Heart },
  { name: "Mon profil", href: "/dashboard/profile", icon: User },
  { name: "Mes adresses", href: "/dashboard/addresses", icon: MapPin },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Mes consultations", href: "/dashboard/consultations", icon: MessageSquare },
  { name: "Programme fidelite", href: "/dashboard/loyalty", icon: Gift },
]

export function DashboardMobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold">
            Nella<span className="text-primary">@House</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          Retour a la boutique
        </Link>
        
        <div className="h-px bg-border my-2" />

        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Deconnexion
        </Button>
      </div>
    </div>
  )
}
