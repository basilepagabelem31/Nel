"use client"

import { useState } from "react"
import { User, Mail, Phone, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  profile: {
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone: profile.phone || "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      })
      .eq("id", profile.id)

    if (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise a jour" })
    } else {
      setMessage({ type: "success", text: "Profil mis a jour avec succes" })
      router.refresh()
    }

    setLoading(false)
  }

  const initials = formData.first_name && formData.last_name
    ? `${formData.first_name[0]}${formData.last_name[0]}`
    : profile.email?.[0]?.toUpperCase() || "U"

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Mettez a jour vos informations de profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                Changer la photo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG ou GIF. 1MB max.
              </p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === "success" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prenom</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="pl-10"
                  placeholder="Votre prenom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={profile.email || ""}
                className="pl-10"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              L email ne peut pas être modifie
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telephone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
