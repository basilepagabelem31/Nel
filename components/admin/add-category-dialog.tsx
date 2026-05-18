// Chemin : components/admin/add-category-dialog.tsx
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
}

interface AddCategoryDialogProps {
  categories: Category[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function AddCategoryDialog({ categories }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_id: "none",
    sort_order: 0,
    is_active: true,
  })

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Le nom est obligatoire")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from("categories").insert({
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description || null,
        parent_id: form.parent_id === "none" ? null : form.parent_id,
        sort_order: form.sort_order,
        is_active: form.is_active,
      })

      if (error) {
        toast.error(error.message.includes("unique") ? "Ce nom de catégorie existe déjà" : "Erreur lors de la création")
        return
      }

      toast.success("Catégorie créée avec succès")
      setForm({ name: "", description: "", parent_id: "none", sort_order: 0, is_active: true })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une catégorie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom <span className="text-destructive">*</span></Label>
            <Input
              placeholder="Ex: Bazin, Soies..."
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {form.name && (
              <p className="text-xs text-muted-foreground">Slug: {slugify(form.name)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Description de la catégorie..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie parente</Label>
            <Select value={form.parent_id} onValueChange={(v) => setForm(f => ({ ...f, parent_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Aucune (catégorie racine)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ordre d'affichage</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
            />
            <Label>Active (visible sur le site)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
            {isPending ? "Création..." : "Créer la catégorie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}