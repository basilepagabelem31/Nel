// Chemin : components/admin/consultation-actions.tsx
"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, UserCheck, Eye, X } from "lucide-react"
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
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { assignAdvisor, updateConsultationStatus } from "@/lib/actions/consultations"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Consultation {
  id: string
  status: string
  client_id: string
}

interface Advisor {
  id: string
  first_name: string
  last_name: string
}

interface ConsultationActionsProps {
  consultation: Consultation
  advisors: Advisor[]
}

export function ConsultationActions({ consultation, advisors }: ConsultationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("")

  const handleAssign = () => {
    if (!selectedAdvisor) {
      toast.error("Veuillez sélectionner un conseiller")
      return
    }

    startTransition(async () => {
      const result = await assignAdvisor(consultation.id, selectedAdvisor)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Conseiller assigné avec succès")
        setAssignOpen(false)
        router.refresh()
      }
    })
  }

  const handleStatusUpdate = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateConsultationStatus(consultation.id, newStatus as any)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Statut mis à jour : ${getStatusLabel(newStatus)}`)
        router.refresh()
      }
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "assigned": return "Assignée"
      case "in_progress": return "En cours"
      case "completed": return "Terminée"
      case "cancelled": return "Annulée"
      default: return status
    }
  }

  const canAssign = consultation.status === "pending"
  const canStart = consultation.status === "assigned"
  const canComplete = consultation.status === "in_progress"
  const canCancel = ["pending", "assigned", "in_progress"].includes(consultation.status)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/consultations/${consultation.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </Link>
          </DropdownMenuItem>

          {canAssign && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAssignOpen(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assigner un conseiller
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          {canStart && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("in_progress")}>
              Marquer en cours
            </DropdownMenuItem>
          )}

          {canComplete && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
              Marquer terminée
            </DropdownMenuItem>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleStatusUpdate("cancelled")}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog d'assignation */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un conseiller</DialogTitle>
            <DialogDescription>
              Sélectionnez un conseiller pour prendre en charge cette consultation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conseiller</Label>
              <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un conseiller" />
                </SelectTrigger>
                <SelectContent>
                  {advisors.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      {advisor.first_name} {advisor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssign} disabled={isPending || !selectedAdvisor}>
              {isPending ? "Assignation..." : "Assigner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}