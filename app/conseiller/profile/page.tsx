// Chemin : app/conseiller/profile/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, Save, User } from "lucide-react"
import { updateProfile } from "@/lib/actions/profile"

export const metadata = {
  title: "Mon profil | Conseiller",
}

export default async function ConseillerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "C"
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    gestionnaire: "Gestionnaire",
    conseiller: "Conseiller",
    client: "Client",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Avatar et infos */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {profile?.first_name} {profile?.last_name || ""}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-4">
                <Badge className="bg-primary/10 text-primary">
                  {roleLabels[profile?.role || "client"]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Membre depuis {new Date(profile?.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Rôle: {roleLabels[profile?.role || "client"]}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Formulaire de modification */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Modifier mes informations</CardTitle>
              <CardDescription>Mettez à jour vos coordonnées</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateProfile} className="space-y-4">
                <input type="hidden" name="user_id" value={user.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input 
                      name="first_name" 
                      defaultValue={profile?.first_name || ""} 
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input 
                      name="last_name" 
                      defaultValue={profile?.last_name || ""} 
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    name="phone" 
                    defaultValue={profile?.phone || ""} 
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}