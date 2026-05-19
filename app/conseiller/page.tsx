// Chemin : app/conseiller/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, CheckCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ConsultationCard } from "@/components/conseiller/consultation-card"

export const metadata = {
  title: "Tableau de bord | Conseiller",
}

export default async function ConseillerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer les consultations assignées au conseiller
  const { data: consultations } = await supabase
    .from("consultations")
    .select(`
      *,
      profiles:client_id (first_name, last_name, email, phone)
    `)
    .eq("advisor_id", user.id)
    .order("created_at", { ascending: false })

  // Statistiques
  const pendingCount = consultations?.filter(c => c.status === "pending" || c.status === "assigned").length || 0
  const inProgressCount = consultations?.filter(c => c.status === "in_progress").length || 0
  const completedCount = consultations?.filter(c => c.status === "completed").length || 0

  // Consultations en attente de réponse (prioritaires)
  const pendingConsultations = consultations?.filter(c => c.status === "pending" || c.status === "assigned").slice(0, 5) || []

  // Consultations en cours
  const inProgressConsultations = consultations?.filter(c => c.status === "in_progress").slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord Conseiller</h1>
        <p className="text-muted-foreground">Gérez vos consultations et suivez vos clients</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">À traiter</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Consultations actives</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Traitées</p>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Consultations terminées</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations en attente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Consultations à traiter</CardTitle>
            <CardDescription>Demandes en attente de votre réponse</CardDescription>
          </div>
          <Link href="/conseiller/consultations?status=pending">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingConsultations.length > 0 ? (
            <div className="space-y-4">
              {pendingConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune consultation en attente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultations en cours */}
      {inProgressConsultations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Consultations en cours</CardTitle>
              <CardDescription>Vos échanges en cours avec les clients</CardDescription>
            </div>
            <Link href="/conseiller/consultations?status=in_progress">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}