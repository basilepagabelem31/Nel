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
  LogOut
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

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="hidden lg:block w-64 bg-card border-r border-border min-h-[calc(100vh-65px)] p-6">
      <nav className="space-y-2">
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

      <div className="mt-8 pt-6 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Deconnexion
        </Button>
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm font-medium mb-1">Besoin d aide ?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Notre equipe est la pour vous aider
        </p>
        <Link href="/contact">
          <Button size="sm" variant="outline" className="w-full">
            Nous contacter
          </Button>
        </Link>
      </div>
    </aside>
  )
}
