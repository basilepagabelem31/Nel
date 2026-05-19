// Chemin : app/conseiller/clients/[id]/page.tsx
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, MessageCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Détail client | Conseiller",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConseillerClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Récupérer les informations du client
  const { data: client } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!client) notFound()

  // Récupérer les consultations du client avec ce conseiller
  const { data: consultations } = await supabase
    .from("consultations")
    .select("*")
    .eq("client_id", id)
    .eq("advisor_id", user.id)
    .order("created_at", { ascending: false })

  const getInitials = () => {
    if (client.first_name && client.last_name) {
      return `${client.first_name[0]}${client.last_name[0]}`.toUpperCase()
    }
    return client.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/conseiller/clients">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Détail client</h1>
          <p className="text-muted-foreground">Informations et historique des consultations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {client.first_name} {client.last_name || ""}
                </h2>
                <p className="text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Inscrit le {new Date(client.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {consultations && consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{consultation.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(consultation.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant={
                        consultation.status === "completed" ? "default" :
                        consultation.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {consultation.status === "completed" ? "Terminée" :
                         consultation.status === "in_progress" ? "En cours" : "En attente"}
                      </Badge>
                    </div>
                    {consultation.advisor_response && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {consultation.advisor_response}
                      </p>
                    )}
                    <Link href={`/conseiller/consultations/${consultation.id}`}>
                      <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                        Voir le détail
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>Aucune consultation avec ce client</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}