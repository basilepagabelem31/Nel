// Chemin : components/admin/product-form.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/lib/actions/products"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  categories: Category[]
  product?: any // existing product for edit mode
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const isEdit = !!product
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || "",
    description: product?.description || "",
    composition: product?.composition || "",
    origin_country: product?.origin_country || "",
    base_price: product?.base_price?.toString() || "",
    discount_price: product?.discount_price?.toString() || "",
    stock_quantity: product?.stock_quantity?.toString() || "0",
    status: product?.status || "draft",
    is_featured: product?.is_featured || false,
  })

  // Images management
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [images, setImages] = useState<{ url: string; alt_text: string; is_primary: boolean }[]>(
    product?.product_images || []
  )

  // Variants management
  const [variants, setVariants] = useState<{ color: string; size: string; additional_price: string; stock_quantity: string }[]>(
    product?.product_variants?.map((v: any) => ({
      color: v.color || "",
      size: v.size || "",
      additional_price: v.additional_price?.toString() || "0",
      stock_quantity: v.stock_quantity?.toString() || "0",
    })) || []
  )

  const addImage = () => {
    if (!imageUrl.trim()) return
    const isPrimary = images.length === 0
    setImages(prev => [...prev, { url: imageUrl.trim(), alt_text: imageAlt.trim(), is_primary: isPrimary }])
    setImageUrl("")
    setImageAlt("")
  }

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      // ensure one primary
      if (next.length > 0 && !next.some(img => img.is_primary)) {
        next[0].is_primary = true
      }
      return next
    })
  }

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { color: "", size: "", additional_price: "0", stock_quantity: "0" }])
  }

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }

  const updateVariant = (idx: number, field: string, value: string) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  const handleSubmit = () => {
    if (!form.name || !form.base_price) {
      toast.error("Le nom et le prix sont obligatoires")
      return
    }

    startTransition(async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.toString()))

      let result
      if (isEdit) {
        result = await updateProduct(product.id, fd)
      } else {
        result = await createProduct(fd)
      }

      if (result?.error) {
        toast.error(result.error)
        return
      }

      // Save images if edit mode (create redirects to edit)
      if (isEdit) {
        const supabase = createClient()
        // Delete existing images and re-insert
        await supabase.from("product_images").delete().eq("product_id", product.id)
        if (images.length > 0) {
          await supabase.from("product_images").insert(
            images.map((img, i) => ({ product_id: product.id, url: img.url, alt_text: img.alt_text, is_primary: img.is_primary, sort_order: i }))
          )
        }

        // Delete existing variants and re-insert
        await supabase.from("product_variants").delete().eq("product_id", product.id)
        if (variants.length > 0) {
          await supabase.from("product_variants").insert(
            variants.map(v => ({
              product_id: product.id,
              color: v.color || null,
              size: v.size || null,
              additional_price: parseFloat(v.additional_price) || 0,
              stock_quantity: parseInt(v.stock_quantity) || 0,
            }))
          )
        }

        toast.success("Produit mis à jour")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Infos principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nom du produit <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Bazin Brodé Premium"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="Description détaillée du produit..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Composition du tissu</Label>
              <Input
                value={form.composition}
                onChange={(e) => setForm(f => ({ ...f, composition: e.target.value }))}
                placeholder="Ex: 100% coton, soie naturelle..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pays d'origine</Label>
              <Input
                value={form.origin_country}
                onChange={(e) => setForm(f => ({ ...f, origin_country: e.target.value }))}
                placeholder="Ex: Sénégal, Nigeria..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prix & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Prix & Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Prix de base (EUR) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.base_price}
                onChange={(e) => setForm(f => ({ ...f, base_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prix promotionnel (EUR)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price}
                onChange={(e) => setForm(f => ({ ...f, discount_price: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm(f => ({ ...f, is_featured: v }))}
              />
              <Label>Mis en avant (page d'accueil)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="URL de l'image (ex: https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Texte alternatif"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={addImage} disabled={!imageUrl.trim()}>
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{img.url}</p>
                    {img.alt_text && <p className="text-xs text-muted-foreground">{img.alt_text}</p>}
                  </div>
                  {img.is_primary ? (
                    <Badge className="bg-green-100 text-green-800 shrink-0">Principale</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setPrimary(idx)} className="shrink-0 text-xs">
                      Définir principale
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeImage(idx)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variantes</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariant} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune variante. Cliquez sur "Ajouter" pour créer des variantes (couleurs, tailles).
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Couleur</Label>
                    <Input
                      placeholder="Rouge, Bleu..."
                      value={v.color}
                      onChange={(e) => updateVariant(idx, "color", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Taille / Métrage</Label>
                    <Input
                      placeholder="XL, 3m..."
                      value={v.size}
                      onChange={(e) => updateVariant(idx, "size", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Supplément (EUR)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={v.additional_price}
                      onChange={(e) => updateVariant(idx, "additional_price", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => updateVariant(idx, "stock_quantity", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !form.name || !form.base_price}>
          {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le produit"}
        </Button>
      </div>
    </div>
  )
}