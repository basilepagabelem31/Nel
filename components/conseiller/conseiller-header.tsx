// Chemin : components/conseiller/conseiller-header.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface ConseillerHeaderProps {
  user: any
  profile: any
}

export function ConseillerHeader({ user, profile }: ConseillerHeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

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
  }, [user])

  const getInitials = () => {
    const firstName = profile?.first_name || ""
    const lastName = profile?.last_name || ""
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || "C"
  }

  const navItems = [
    { href: "/conseiller", label: "Dashboard" },
    { href: "/conseiller/consultations", label: "Consultations" },
    { href: "/conseiller/clients", label: "Clients" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/conseiller" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Nella<span className="text-primary">@House</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex">
                Conseiller
              </Badge>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 ml-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/conseiller/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/conseiller/profile">
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">
                  {profile?.first_name || "Conseiller"}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}