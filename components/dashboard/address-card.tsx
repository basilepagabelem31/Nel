// Chemin : components/dashboard/address-card.tsx
"use client"

import { useState, useTransition } from "react"
import { MapPin, Pencil, Trash2, Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateAddress, deleteAddress } from "@/lib/actions/addresses"
import { useRouter } from "next/navigation"

interface Address {
  id: string
  label: string | null
  street: string
  city: string
  state: string | null
  zip_code: string | null
  country: string
  is_default: boolean
}

interface AddressCardProps {
  address: Address
}

export function AddressCard({ address }: AddressCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    label: address.label || "",
    street: address.street,
    city: address.city,
    state: address.state || "",
    zip_code: address.zip_code || "",
    country: address.country,
    is_default: address.is_default,
  })

  const handleUpdate = () => {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.toString()))

      const result = await updateAddress(address.id, fd)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Adresse mise à jour")
      setEditOpen(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAddress(address.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Adresse supprimée")
      router.refresh()
    })
  }

  return (
    <>
      <Card className={address.is_default ? "border-primary/40 bg-primary/5" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium">
                {address.label || "Adresse"}
              </span>
            </div>
            {address.is_default && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                <Star className="h-3 w-3" />
                Par défaut
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-0.5 ml-6">
            <p>{address.street}</p>
            <p>
              {[address.zip_code, address.city].filter(Boolean).join(" ")}
            </p>
            {address.state && <p>{address.state}</p>}
            <p className="font-medium text-foreground">{address.country}</p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={address.is_default}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'adresse</DialogTitle>
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
                value={form.street}
                onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
                placeholder="Numéro et nom de rue"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code postal</Label>
                <Input
                  value={form.zip_code}
                  onChange={(e) => setForm(f => ({ ...f, zip_code: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ville <span className="text-destructive">*</span></Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Région / État</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
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
              <Label>Adresse par défaut</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button
              onClick={handleUpdate}
              disabled={isPending || !form.street || !form.city || !form.country}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette adresse ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'adresse "{address.label || address.street}" sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}