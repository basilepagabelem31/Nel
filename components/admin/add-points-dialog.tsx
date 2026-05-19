// Chemin : components/admin/add-points-dialog.tsx
"use client"

import { useState, useTransition } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  loyalty_points: number
}

interface AddPointsDialogProps {
  users: User[]
}

export function AddPointsDialog({ users }: AddPointsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    userId: "",
    points: "",
    description: "",
  })

  const handleSubmit = () => {
    if (!form.userId) {
      toast.error("Veuillez sélectionner un utilisateur")
      return
    }
    if (!form.points || parseInt(form.points) <= 0) {
      toast.error("Veuillez entrer un nombre de points valide")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const pointsToAdd = parseInt(form.points)

      // Récupérer les points actuels de l'utilisateur
      const { data: user } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", form.userId)
        .single()

      if (!user) {
        toast.error("Utilisateur non trouvé")
        return
      }

      // Mettre à jour les points
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ loyalty_points: (user.loyalty_points || 0) + pointsToAdd })
        .eq("id", form.userId)

      if (updateError) {
        toast.error("Erreur lors de l'ajout des points")
        return
      }

      // Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from("loyalty_transactions")
        .insert({
          user_id: form.userId,
          type: "earned",
          points: pointsToAdd,
          description: form.description || `Ajout manuel de ${pointsToAdd} points par l'administrateur`,
        })

      if (transactionError) {
        console.error("Erreur transaction:", transactionError)
      }

      toast.success(`${pointsToAdd} points ajoutés avec succès`)
      setOpen(false)
      setForm({ userId: "", points: "", description: "" })
      router.refresh()
    })
  }

  const selectedUser = users.find(u => u.id === form.userId)
  const selectedUserName = selectedUser 
    ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() || selectedUser.email
    : ""

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter des points
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter des points de fidélité</DialogTitle>
          <DialogDescription>
            Attribuez des points supplémentaires à un client
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={form.userId} onValueChange={(v) => setForm(f => ({ ...f, userId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name || ""} - {user.email} ({user.loyalty_points || 0} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre de points à ajouter</Label>
            <Input
              type="number"
              min="1"
              placeholder="Ex: 100"
              value={form.points}
              onChange={(e) => setForm(f => ({ ...f, points: e.target.value }))}
            />
            {form.points && (
              <p className="text-xs text-muted-foreground">
                Valeur approximative: {Math.floor(parseInt(form.points) / 100)} € de réduction
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description (optionnelle)</Label>
            <Textarea
              placeholder="Ex: Bon anniversaire, Gestes commercial, etc."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          {selectedUser && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Points actuels:</span>{" "}
                <span className="font-bold">{selectedUser.loyalty_points || 0} pts</span>
              </p>
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Nouveau total:</span>{" "}
                <span className="font-bold text-primary">
                  {(selectedUser.loyalty_points || 0) + (parseInt(form.points) || 0)} pts
                </span>
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              "Ajouter les points"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}