// Chemin : components/admin/add-promo-code-dialog.tsx
"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AddPromoCodeDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_amount: "",
    max_uses: "",
    start_date: today,
    end_date: nextMonth,
    is_active: true,
  })

  const handleSubmit = () => {
    if (!form.code.trim() || !form.value) {
      toast.error("Code et valeur sont obligatoires")
      return
    }
    if (parseFloat(form.value) <= 0) {
      toast.error("La valeur doit être positive")
      return
    }
    if (form.type === "percentage" && parseFloat(form.value) > 100) {
      toast.error("Le pourcentage ne peut pas dépasser 100%")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from("promo_codes").insert({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active,
      })

      if (error) {
        toast.error(error.message.includes("unique") ? "Ce code existe déjà" : "Erreur lors de la création")
        return
      }

      toast.success("Code promo créé")
      setForm({ code: "", type: "percentage", value: "", min_order_amount: "", max_uses: "", start_date: today, end_date: nextMonth, is_active: true })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un code promotionnel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Code <span className="text-destructive">*</span></Label>
            <Input
              placeholder="Ex: AFRICAN20"
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">Montant fixe (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valeur <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min="0"
                max={form.type === "percentage" ? 100 : undefined}
                step="0.01"
                placeholder={form.type === "percentage" ? "Ex: 20" : "Ex: 10.00"}
                value={form.value}
                onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Commande minimum (EUR)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Optionnel"
                value={form.min_order_amount}
                onChange={(e) => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Utilisations max.</Label>
              <Input
                type="number"
                min="1"
                placeholder="Illimité"
                value={form.max_uses}
                onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={form.end_date}
                min={form.start_date}
                onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
            />
            <Label>Activer immédiatement</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.code || !form.value}>
            {isPending ? "Création..." : "Créer le code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}