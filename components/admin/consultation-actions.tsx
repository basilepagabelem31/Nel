// Chemin : components/admin/consultation-actions.tsx
"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, UserCheck, MessageSquare, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { assignAdvisor, respondToConsultation } from "@/lib/actions/consultations"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Advisor {
  id: string
  first_name: string
  last_name: string
}

interface ConsultationActionsProps {
  consultation: any
  advisors: Advisor[]
}

export function ConsultationActions({ consultation, advisors }: ConsultationActionsProps) {
  const [respondOpen, setRespondOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [response, setResponse] = useState(consultation.advisor_response || "")
  const [selectedAdvisor, setSelectedAdvisor] = useState(consultation.advisor_id || "")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRespond = (status: "in_progress" | "completed") => {
    if (!response.trim()) {
      toast.error("La réponse ne peut pas être vide")
      return
    }
    startTransition(async () => {
      const result = await respondToConsultation(consultation.id, response, status)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(status === "completed" ? "Consultation marquée comme traitée" : "Réponse envoyée")
      setRespondOpen(false)
      router.refresh()
    })
  }

  const handleAssign = () => {
    if (!selectedAdvisor) {
      toast.error("Sélectionnez un conseiller")
      return
    }
    startTransition(async () => {
      const result = await assignAdvisor(consultation.id, selectedAdvisor)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Conseiller assigné")
      setAssignOpen(false)
      router.refresh()
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("consultations")
        .update({ status: "cancelled" })
        .eq("id", consultation.id)

      if (error) {
        toast.error("Erreur lors de l'annulation")
        return
      }
      toast.success("Consultation annulée")
      router.refresh()
    })
  }

  const canRespond = !["cancelled"].includes(consultation.status)
  const canCancel = !["completed", "cancelled"].includes(consultation.status)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {advisors.length > 0 && consultation.status === "pending" && (
            <DropdownMenuItem onClick={() => setAssignOpen(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Assigner un conseiller
            </DropdownMenuItem>
          )}
          {canRespond && (
            <DropdownMenuItem onClick={() => setRespondOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Répondre
            </DropdownMenuItem>
          )}
          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleCancel}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler la consultation
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Respond Dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Répondre à la consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Demande du client :</p>
              <p className="text-sm font-semibold">{consultation.event_type}</p>
              {consultation.event_date && (
                <p className="text-sm text-muted-foreground">
                  Date : {new Date(consultation.event_date).toLocaleDateString("fr-FR")}
                </p>
              )}
              {consultation.budget && (
                <p className="text-sm text-muted-foreground">Budget : {Number(consultation.budget).toFixed(0)} EUR</p>
              )}
              {consultation.preferences && (
                <p className="text-sm text-muted-foreground">Préférences : {consultation.preferences}</p>
              )}
              {consultation.client_message && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{consultation.client_message}</p>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Votre réponse / recommandations</Label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                placeholder="Recommandez des produits, donnez des conseils de style adaptés à l'événement..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRespondOpen(false)}>Annuler</Button>
            <Button
              variant="outline"
              onClick={() => handleRespond("in_progress")}
              disabled={isPending || !response.trim()}
            >
              Enregistrer (en cours)
            </Button>
            <Button
              onClick={() => handleRespond("completed")}
              disabled={isPending || !response.trim()}
            >
              {isPending ? "Envoi..." : "Marquer comme traitée"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un conseiller</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Conseiller</Label>
            <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un conseiller" />
              </SelectTrigger>
              <SelectContent>
                {advisors.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.first_name} {a.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Button>
            <Button onClick={handleAssign} disabled={isPending || !selectedAdvisor}>
              {isPending ? "Assignation..." : "Assigner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}