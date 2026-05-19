// Chemin : app/conseiller/consultations/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsultationCard } from "@/components/conseiller/consultation-card"

export const metadata = {
  title: "Mes consultations | Conseiller",
}

export default async function ConseillerConsultationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer toutes les consultations du conseiller
  const { data: consultations } = await supabase
    .from("consultations")
    .select(`
      *,
      profiles:client_id (first_name, last_name, email, phone)
    `)
    .eq("advisor_id", user.id)
    .order("created_at", { ascending: false })

  const pending = consultations?.filter(c => c.status === "pending" || c.status === "assigned") || []
  const inProgress = consultations?.filter(c => c.status === "in_progress") || []
  const completed = consultations?.filter(c => c.status === "completed") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes consultations</h1>
        <p className="text-muted-foreground">Gérez les demandes de conseil de vos clients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les consultations</CardTitle>
          <CardDescription>{consultations?.length || 0} consultation(s) au total</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger>
              <TabsTrigger value="in_progress">En cours ({inProgress.length})</TabsTrigger>
              <TabsTrigger value="completed">Terminées ({completed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pending.length > 0 ? (
                pending.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune consultation en attente
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {inProgress.length > 0 ? (
                inProgress.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune consultation en cours
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completed.length > 0 ? (
                completed.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune consultation terminée
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}