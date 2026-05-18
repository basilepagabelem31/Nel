// Chemin : components/dashboard/add-address-dialog.tsx
"use client"

import { useState, useTransition } from "react"
import { MapPin, Plus } from "lucide-react"
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
import { toast } from "sonner"
import { addAddress } from "@/lib/actions/addresses"
import { useRouter } from "next/navigation"

interface AddAddressDialogProps {
  userId: string
}

export function AddAddressDialog({ userId }: AddAddressDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "France",
    is_default: false,
  })

  const reset = () => {
    setForm({ label: "", street: "", city: "", state: "", zip_code: "", country: "France", is_default: false })
  }

  const handleSubmit = () => {
    if (!form.street || !form.city || !form.country) {
      toast.error("Adresse, ville et pays sont requis")
      return
    }

    startTransition(async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.toString()))

      const result = await addAddress(userId, fd)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Adresse ajoutée")
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une adresse
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Nouvelle adresse
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Libellé (optionnel)</Label>
            <Input
              placeholder="Ex: Maison, Bureau..."
              value={form.label}
              onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Adresse <span className="text-destructive">*</span></Label>
            <Input
              placeholder="12 rue des Acacia..."
              value={form.street}
              onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Code postal</Label>
              <Input
                value={form.zip_code}
                onChange={(e) => setForm(f => ({ ...f, zip_code: e.target.value }))}
                placeholder="75001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ville <span className="text-destructive">*</span></Label>
              <Input
                value={form.city}
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Paris"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Région / État</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="Île-de-France"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pays <span className="text-destructive">*</span></Label>
              <Input
                value={form.country}
                onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_default}
              onCheckedChange={(v) => setForm(f => ({ ...f, is_default: v }))}
            />
            <Label>Définir comme adresse par défaut</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.street || !form.city || !form.country}
          >
            {isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}