// Chemin : components/admin/category-actions.tsx
"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

interface CategoryActionsProps {
  category: Category
  allCategories: Category[]
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

export function CategoryActions({ category, allCategories }: CategoryActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    name: category.name,
    description: category.description || "",
    parent_id: category.parent_id || "none",
    sort_order: category.sort_order,
    is_active: category.is_active,
  })

  const handleEdit = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("categories")
        .update({
          name: form.name,
          slug: slugify(form.name),
          description: form.description || null,
          parent_id: form.parent_id === "none" ? null : form.parent_id,
          sort_order: form.sort_order,
          is_active: form.is_active,
        })
        .eq("id", category.id)

      if (error) {
        toast.error("Erreur lors de la modification")
        return
      }

      toast.success("Catégorie modifiée")
      setEditOpen(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id)

      if (error) {
        toast.error("Impossible de supprimer (des produits y sont peut-être liés)")
        return
      }

      toast.success("Catégorie supprimée")
      setDeleteOpen(false)
      router.refresh()
    })
  }

  const otherCategories = allCategories.filter(c => c.id !== category.id)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
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
                  {otherCategories.map(c => (
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
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleEdit} disabled={isPending || !form.name}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La catégorie <strong>{category.name}</strong> sera supprimée définitivement.
              Les produits liés auront leur catégorie mise à null.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}