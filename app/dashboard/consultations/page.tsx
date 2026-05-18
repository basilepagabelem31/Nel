// Chemin : app/dashboard/consultations/page.tsx

import Link from "next/link"
import { MessageSquare, Plus, Clock, CheckCircle, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Mes consultations",
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  pending: { label: "En attente", variant: "outline", color: "text-amber-600" },
  assigned: { label: "Assignée", variant: "secondary", color: "text-blue-600" },
  in_progress: { label: "En cours", variant: "secondary", color: "text-purple-600" },
  completed: { label: "Traitée", variant: "default", color: "text-green-600" },
  cancelled: { label: "Annulée", variant: "destructive", color: "text-red-600" },
}

export default async function ConsultationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: consultations } = await supabase
    .from("consultations")
    .select(`
      *,
      profiles!consultations_advisor_id_fkey (first_name, last_name)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes consultations</h1>
          <p className="text-muted-foreground">Vos demandes de conseil vestimentaire</p>
        </div>
        <Link href="/consultation">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {consultations && consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map((consultation) => {
            const status = statusMap[consultation.status] || statusMap.pending
            return (
              <Card key={consultation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{consultation.event_type}</CardTitle>
                      <CardDescription>
                        Demandée le {new Date(consultation.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {consultation.event_date && (
                      <div>
                        <span className="text-muted-foreground">Date de l'événement : </span>
                        <span className="font-medium">
                          {new Date(consultation.event_date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                    {consultation.budget && (
                      <div>
                        <span className="text-muted-foreground">Budget : </span>
                        <span className="font-medium">{Number(consultation.budget).toFixed(2)} EUR</span>
                      </div>
                    )}
                    {consultation.profiles && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Conseiller : </span>
                        <span className="font-medium">
                          {(consultation.profiles as any).first_name} {(consultation.profiles as any).last_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {consultation.client_message && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Votre message :</p>
                      <p className="text-sm text-muted-foreground">{consultation.client_message}</p>
                    </div>
                  )}

                  {consultation.advisor_response && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium mb-1 text-primary">Réponse du conseiller :</p>
                      <p className="text-sm">{consultation.advisor_response}</p>
                      {consultation.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Répondu le {new Date(consultation.responded_at).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune consultation</h3>
            <p className="text-muted-foreground mb-6">
              Demandez conseil à nos experts en style africain pour votre prochain événement
            </p>
            <Link href="/consultation">
              <Button>Demander un conseil</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}