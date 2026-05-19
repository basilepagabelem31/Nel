// Chemin : components/conseiller/consultation-card.tsx
"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, MessageCircle, ArrowRight } from "lucide-react"

interface ConsultationCardProps {
  consultation: any
}

export function ConsultationCard({ consultation }: ConsultationCardProps) {
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
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-medium">{consultation.event_type}</h3>
          {getStatusBadge(consultation.status)}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{consultation.profiles?.first_name} {consultation.profiles?.last_name}</span>
          </div>
          {consultation.event_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(consultation.event_date).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span className="truncate max-w-md">
              {consultation.client_message?.substring(0, 100)}
              {consultation.client_message?.length > 100 ? "..." : ""}
            </span>
          </div>
        </div>
      </div>
      <Link href={`/conseiller/consultations/${consultation.id}`}>
        <Button variant="ghost" size="sm" className="gap-1">
          Traiter
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}