"use client"

import { Menu, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminMobileNav } from "./admin-mobile-nav"
import type { User } from "@supabase/supabase-js"

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-sidebar border-b border-sidebar-border h-16 flex items-center px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <AdminMobileNav />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-sidebar-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3 pl-3 border-l border-sidebar-border">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {user.email?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-sidebar-foreground">{user.email}</p>
            <p className="text-xs text-sidebar-foreground/60">Administrateur</p>
          </div>
        </div>
      </div>
    </header>
  )
}
