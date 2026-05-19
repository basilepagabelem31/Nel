// Chemin : components/admin/product-form.tsx
"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Trash2, ImagePlus, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  

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
  const [images, setImages] = useState<{ url: string; alt_text: string; is_primary: boolean; file?: File; path?: string }[]>(
    product?.product_images?.map((img: any) => ({
      url: img.url,
      alt_text: img.alt_text || "",
      is_primary: img.is_primary || false,
    })) || []
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

  // Upload d'image vers Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    setUploadingImage(true)
    const supabase = createClient()
    
    try {
      // Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Vous devez être connecté pour uploader des images")
        return null
      }

      // Générer un nom unique pour l'image
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        toast.error(`Erreur d'upload: ${uploadError.message}`)
        return null
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} n'est pas une image`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5MB`)
        continue
      }

      const imageUrl = await uploadImageToStorage(file)
      if (imageUrl) {
        const isPrimary = images.length === 0
        setImages(prev => [...prev, { 
          url: imageUrl, 
          alt_text: form.name || file.name, 
          is_primary: isPrimary,
          file 
        }])
        toast.success(`${file.name} uploadé avec succès`)
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addImageByUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image")
      return
    }
    const isPrimary = images.length === 0
    setImages(prev => [...prev, { 
      url: imageUrl.trim(), 
      alt_text: imageAlt.trim() || form.name, 
      is_primary: isPrimary 
    }])
    setImageUrl("")
    setImageAlt("")
    toast.success("Image ajoutée")
  }

  const removeImage = async (idx: number) => {
    const imageToRemove = images[idx]
    
    // Si c'est une image uploadée récemment (avec un fichier), on pourrait la supprimer du storage
    // Pour simplifier, on laisse le storage gérer les orphelines
    
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length > 0 && !next.some(img => img.is_primary)) {
        next[0].is_primary = true
      }
      return next
    })
    toast.success("Image supprimée")
  }

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })))
    toast.success("Image principale définie")
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

 // Dans components/admin/product-form.tsx, remplacez la fonction handleSubmit

const handleSubmit = () => {
  if (!form.name || !form.base_price) {
    toast.error("Le nom et le prix sont obligatoires")
    return
  }

  startTransition(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Vous devez être connecté")
      return
    }

    // Générer le slug
    const slug = form.name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const productData = {
      name: form.name,
      slug,
      category_id: form.category_id || null,
      description: form.description,
      composition: form.composition,
      origin_country: form.origin_country,
      base_price: parseFloat(form.base_price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      status: form.status,
      is_featured: form.is_featured,
      sku: product?.sku || `NH-${Date.now().toString(36).toUpperCase()}`,
    }

    let productId = product?.id

    if (isEdit) {
      // Mise à jour du produit
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      productId = product.id

      // 🔥 IMPORTANT: Supprimer les anciennes images
      const { data: oldImages } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", product.id)

      // Supprimer les anciennes images de la base
      await supabase.from("product_images").delete().eq("product_id", product.id)
      
      // Supprimer les anciennes variantes
      await supabase.from("product_variants").delete().eq("product_id", product.id)
    } else {
      // Création du nouveau produit
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .single()

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      productId = newProduct.id
    }

    // 🔥 Insérer les NOUVELLES images (remplacement total)
    if (images.length > 0) {
      const imagesToInsert = images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt_text || form.name,
        is_primary: img.is_primary,
        sort_order: i
      }))
      
      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (imagesError) {
        console.error("Erreur insertion images:", imagesError)
        toast.error("Erreur lors de l'insertion des images")
      }
    }

    // Insérer les nouvelles variantes
    if (variants.length > 0) {
      const variantsToInsert = variants
        .map(v => ({
          product_id: productId,
          color: v.color || null,
          size: v.size || null,
          additional_price: parseFloat(v.additional_price) || 0,
          stock_quantity: parseInt(v.stock_quantity) || 0,
        }))
        .filter(v => v.color || v.size)
      
      if (variantsToInsert.length > 0) {
        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert)

        if (variantsError) {
          console.error("Erreur insertion variantes:", variantsError)
        }
      }
    }

    toast.success(isEdit ? "Produit mis à jour" : "Produit créé avec succès")
    router.push("/admin/products")
    router.refresh()
  })
}

  return (
    <div className="space-y-6">
      {/* Upload par fichier */}
      <Card>
        <CardHeader>
          <CardTitle>Upload d'images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="gap-2"
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Choisir des images sur l'ordinateur
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              PNG, JPG, JPEG jusqu'à 5MB
            </p>
          </div>
        </CardContent>
      </Card>

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

      {/* Images existantes */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images actuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group border rounded-lg overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <Image
                      src={img.url}
                      alt={img.alt_text}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {img.is_primary && (
                    <div className="absolute bottom-1 left-1">
                      <Badge className="bg-primary text-primary-foreground text-xs">Principal</Badge>
                    </div>
                  )}
                  {!img.is_primary && images.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-1 right-1 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPrimary(idx)}
                    >
                      Définir principal
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ajout par URL */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter par URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
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
              className="sm:w-48"
            />
            <Button variant="outline" onClick={addImageByUrl} disabled={!imageUrl.trim()}>
              <ImagePlus className="h-4 w-4 mr-2" />
              Ajouter l'URL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variantes (couleurs, tailles)</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariant} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Ajouter une variante
          </Button>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune variante. Cliquez sur "Ajouter une variante" pour créer des variantes (couleurs, tailles).
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
      <div className="flex justify-end gap-3 sticky bottom-4 bg-background p-4 rounded-lg border shadow-sm">
        <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !form.name || !form.base_price}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            isEdit ? "Mettre à jour" : "Créer le produit"
          )}
        </Button>
      </div>
    </div>
  )
}