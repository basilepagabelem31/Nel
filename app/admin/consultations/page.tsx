// Chemin : app/admin/consultations/page.tsx

import { MessageSquare, Clock, CheckCircle, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { ConsultationActions } from "@/components/admin/consultation-actions"

export const metadata = {
  title: "Gestion des consultations",
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  assigned: { label: "Assignée", className: "bg-blue-100 text-blue-800" },
  in_progress: { label: "En cours", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Traitée", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-800" },
}

export default async function AdminConsultationsPage() {
  const supabase = await createClient()

  const [
    { data: consultations },
    { data: advisors }
  ] = await Promise.all([
    supabase
      .from("consultations")
      .select(`
        *,
        profiles!consultations_client_id_fkey (first_name, last_name, email),
        advisor:profiles!consultations_advisor_id_fkey (first_name, last_name)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "advisor")
  ])

  const pendingCount = consultations?.filter(c => c.status === "pending").length || 0
  const inProgressCount = consultations?.filter(c => ["assigned", "in_progress"].includes(c.status)).length || 0
  const completedCount = consultations?.filter(c => c.status === "completed").length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consultations</h1>
        <p className="text-muted-foreground">Gérez les demandes de conseil vestimentaire</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Traitées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{advisors?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Conseillers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les consultations</CardTitle>
          <CardDescription>{consultations?.length || 0} consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Conseiller</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations && consultations.length > 0 ? (
                consultations.map((c) => {
                  const status = statusConfig[c.status] || statusConfig.pending
                  const client = c.profiles as any
                  const advisor = c.advisor as any

                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client?.first_name} {client?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{client?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{c.event_type}</TableCell>
                      <TableCell>
                        {c.budget ? `${Number(c.budget).toFixed(0)} EUR` : "-"}
                      </TableCell>
                      <TableCell>
                        {advisor ? `${advisor.first_name} ${advisor.last_name}` : (
                          <span className="text-muted-foreground text-sm">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(c.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ConsultationActions
                          consultation={c}
                          advisors={advisors || []}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune consultation pour le moment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}