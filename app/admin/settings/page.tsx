// Chemin : app/admin/settings/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { SettingsIcon, Globe, Mail, CreditCard, Shield, Database, Trash2 } from "lucide-react"
import { getSettings } from "@/lib/actions/settings"
import { SettingsClient } from "./settings-client"

export const metadata = {
  title: "Paramètres | Administration",
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  // ✅ CORRECTION : Un seul return, et on passe settings comme prop
  return (
    <SettingsClient initialSettings={settings}>
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez la configuration de votre boutique</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="shipping">Livraison</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        {/* ==================== ONGLET GÉNÉRAL ==================== */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Configurez les informations de votre boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du site</Label>
                  <Input name="site_name" defaultValue={settings.site_name || "Nella@House Consulting"} />
                </div>
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input name="contact_email" type="email" defaultValue={settings.contact_email || "nellahouseconsulting@gmail.com"} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input name="contact_phone" defaultValue={settings.contact_phone || "+33 1 23 45 67 89"} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input name="contact_address" defaultValue={settings.contact_address || "123 Rue de la Mode, 75001 Paris"} />
              </div>
              <div className="space-y-2">
                <Label>Description du site (SEO)</Label>
                <Input 
                  name="site_description"
                  defaultValue={settings.site_description || "Découvrez notre collection exclusive de mode africaine authentique"} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
              <CardDescription>Liens vers vos pages sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input name="facebook_url" placeholder="https://facebook.com/votre-page" defaultValue={settings.facebook_url || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input name="instagram_url" placeholder="https://instagram.com/votre-compte" defaultValue={settings.instagram_url || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input name="twitter_url" placeholder="https://twitter.com/votre-compte" defaultValue={settings.twitter_url || ""} />
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input name="tiktok_url" placeholder="https://tiktok.com/@votre-compte" defaultValue={settings.tiktok_url || ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET LIVRAISON ==================== */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frais de livraison</CardTitle>
              <CardDescription>Configurez les options de livraison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Seuil de livraison gratuite (EUR)</Label>
                <Input name="shipping_free_threshold" type="number" defaultValue={settings.shipping_free_threshold || "100"} />
                <p className="text-xs text-muted-foreground">
                  Au-delà de ce montant, la livraison est gratuite
                </p>
              </div>
              <div className="space-y-2">
                <Label>Frais de livraison standard (EUR)</Label>
                <Input name="shipping_standard_fee" type="number" step="0.01" defaultValue={settings.shipping_standard_fee || "9.99"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET PAIEMENT ==================== */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Stripe</CardTitle>
              <CardDescription>Mode de paiement Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select name="stripe_mode" defaultValue={settings.stripe_mode || "test"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (sandbox)</SelectItem>
                    <SelectItem value="live">Production (live)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Les clés Stripe sont configurées dans le fichier .env.local
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET AVANCÉ ==================== */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Actions avancées sur la boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Mode maintenance</p>
                  <p className="text-sm text-muted-foreground">Rendre le site inaccessible aux clients</p>
                </div>
                <Switch name="maintenance_mode" defaultChecked={settings.maintenance_mode === "true"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
              <CardDescription>Actions irréversibles</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Réinitialiser la boutique
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes les données (produits, commandes, utilisateurs)
                      seront définitivement supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                      Tout supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsClient>
  )
}