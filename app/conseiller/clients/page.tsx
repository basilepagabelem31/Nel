// Chemin : app/conseiller/clients/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = {
  title: "Mes clients | Conseiller",
}

// Interface pour le type client
interface Client {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  last_consultation: string
  consultation_count: number
  last_status: string
}

export default async function ConseillerClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer les clients avec lesquels le conseiller a interagi
  const { data: consultations } = await supabase
    .from("consultations")
    .select(`
      client_id,
      profiles:client_id (id, first_name, last_name, email, phone, avatar_url, created_at),
      status,
      created_at
    `)
    .eq("advisor_id", user.id)
    .order("created_at", { ascending: false })

  // Regrouper par client unique
  const clientsMap = new Map<string, Client>()
  consultations?.forEach((consultation: any) => {
    const clientData = consultation.profiles
    if (clientData && !clientsMap.has(clientData.id)) {
      // Compter le nombre de consultations pour ce client
      const clientConsultations = consultations.filter((c: any) => c.client_id === clientData.id)
      
      clientsMap.set(clientData.id, {
        id: clientData.id,
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        email: clientData.email,
        phone: clientData.phone,
        avatar_url: clientData.avatar_url,
        created_at: clientData.created_at,
        last_consultation: consultation.created_at,
        consultation_count: clientConsultations.length,
        last_status: consultation.status,
      })
    }
  })

  const clients = Array.from(clientsMap.values())

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return "U"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminée</Badge>
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-800">En cours</Badge>
      case "assigned":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      default:
        return <Badge variant="outline">En attente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes clients</h1>
        <p className="text-muted-foreground">Clients que vous avez accompagnés</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>{clients.length} client(s) accompagné(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Dernière consultation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(client.first_name, client.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {client.first_name} {client.last_name || ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.consultation_count} consultation(s)
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(client.last_consultation).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.last_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/conseiller/clients/${client.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Voir détails
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun client pour le moment</h3>
              <p className="text-muted-foreground">
                Les clients que vous accompagnerez apparaîtront ici
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}