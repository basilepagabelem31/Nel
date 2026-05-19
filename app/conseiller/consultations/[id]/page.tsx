// Chemin : app/conseiller/consultations/[id]/page.tsx
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Mail, Phone, Euro } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ConsultationResponseForm } from "@/components/conseiller/consultation-response-form"

export const metadata = {
  title: "Détail consultation | Conseiller",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: consultation } = await supabase
    .from("consultations")
    .select(`
      *,
      profiles:client_id (first_name, last_name, email, phone, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (!consultation) notFound()

  // Vérifier que le conseiller a le droit de voir cette consultation
  if (consultation.advisor_id !== user.id && consultation.status === "pending") {
    await supabase
      .from("consultations")
      .update({ advisor_id: user.id, status: "assigned" })
      .eq("id", id)
    consultation.advisor_id = user.id
    consultation.status = "assigned"
  }

  if (consultation.advisor_id !== user.id) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
      case "assigned":
        return <Badge className="bg-blue-100 text-blue-800">Assignée</Badge>
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-800">En cours</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminée</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/conseiller/consultations">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Détail de la consultation</h1>
          <p className="text-muted-foreground">Consultez la demande et répondez au client</p>
        </div>
        {getStatusBadge(consultation.status)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Informations client */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{consultation.profiles?.first_name} {consultation.profiles?.last_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{consultation.profiles?.email}</span>
              </div>
              {consultation.profiles?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{consultation.profiles?.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Type d'événement</p>
                  <p>{consultation.event_type}</p>
                </div>
              </div>
              {consultation.event_date && (
                <div>
                  <p className="font-medium text-sm">Date de l'événement</p>
                  <p className="text-sm">{new Date(consultation.event_date).toLocaleDateString("fr-FR")}</p>
                </div>
              )}
              {consultation.budget && (
                <div>
                  <p className="font-medium text-sm">Budget indicatif</p>
                  <p className="text-sm">{consultation.budget} €</p>
                </div>
              )}
              {consultation.preferences && (
                <div>
                  <p className="font-medium text-sm">Préférences</p>
                  <p className="text-sm text-muted-foreground">{consultation.preferences}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {consultation.reference_images && consultation.reference_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images de référence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {consultation.reference_images.map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={url}
                        alt={`Référence ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message et réponse */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message du client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{consultation.client_message}</p>
              </div>
            </CardContent>
          </Card>

          {consultation.advisor_response && (
            <Card>
              <CardHeader>
                <CardTitle>Votre réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{consultation.advisor_response}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ Correction : Un seul formulaire, le composant client */}
          {consultation.status !== "completed" && consultation.status !== "cancelled" && (
            <ConsultationResponseForm consultationId={consultation.id} />
          )}
        </div>
      </div>
    </div>
  )
}