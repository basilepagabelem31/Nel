// Chemin : app/admin/users/users-client.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  MoreHorizontal, Mail, Shield, User as UserIcon, 
  Plus, Pencil, Trash2, Eye, X, Check
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createUser, updateUser, updateUserRole, deleteUser, toggleUserStatus } from "@/lib/actions/users"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  loyalty_points: number
  is_active: boolean
  created_at: string
}

interface UsersClientProps {
  initialUsers: User[]
}

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrateur", color: "bg-red-100 text-red-800" },
  gestionnaire: { label: "Gestionnaire", color: "bg-purple-100 text-purple-800" },
  conseiller: { label: "Conseiller", color: "bg-blue-100 text-blue-800" },
  client: { label: "Client", color: "bg-gray-100 text-gray-800" },
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Formulaire pour ajouter/modifier
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "client",
    password: "",
  })

  // Filtrer les utilisateurs par rôle
  const filteredUsers = filterRole 
    ? users.filter(u => u.role === filterRole)
    : users

  // Statistiques
  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === "client").length,
    admins: users.filter(u => u.role === "admin").length,
    gestionnaires: users.filter(u => u.role === "gestionnaire").length,
    conseillers: users.filter(u => u.role === "conseiller").length,
  }

  const getRoleBadge = (role: string) => {
    const config = roleLabels[role] || roleLabels.client
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "U"
  }

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email?.split("@")[0] || "Utilisateur"
  }

  // Ajouter un utilisateur// Dans users-client.tsx, remplacez les fonctions par :


// Ajouter un utilisateur
const handleAddUser = async () => {
  if (!form.email || !form.password) {
    toast.error("L'email et le mot de passe sont obligatoires")
    return
  }

  setIsPending(true)
  const result = await createUser({
    email: form.email,
    password: form.password,
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone,
    role: form.role,
  })

  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success("Utilisateur créé avec succès")
    setShowAddDialog(false)
    setForm({ email: "", first_name: "", last_name: "", phone: "", role: "client", password: "" })
    router.refresh()
  }
  setIsPending(false)
}

// Modifier un utilisateur
const handleEditUser = async () => {
  if (!selectedUser) return

  setIsPending(true)
  const result = await updateUser(selectedUser.id, {
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone,
  })

  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success("Utilisateur modifié")
    setShowEditDialog(false)
    router.refresh()
  }
  setIsPending(false)
}

// Changer le rôle
const handleRoleChange = async (newRole: string) => {
  if (!selectedUser) return

  setIsPending(true)
  const result = await updateUserRole(selectedUser.id, newRole)

  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success(`Rôle changé en ${roleLabels[newRole]?.label}`)
    setShowRoleDialog(false)
    router.refresh()
  }
  setIsPending(false)
}

// Supprimer un utilisateur
const handleDeleteUser = async () => {
  if (!selectedUser) return

  setIsPending(true)
  const result = await deleteUser(selectedUser.id)

  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success("Utilisateur supprimé")
    setShowDeleteDialog(false)
    router.refresh()
  }
  setIsPending(false)
}

// Activer/Désactiver un utilisateur
const handleToggleActive = async (user: User) => {
  setIsPending(true)
  const result = await toggleUserStatus(user.id, !user.is_active)

  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success(user.is_active ? "Utilisateur désactivé" : "Utilisateur activé")
    router.refresh()
  }
  setIsPending(false)
}

  // Ouvrir le dialogue d'édition
  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setForm({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      role: user.role,
      password: "",
    })
    setShowEditDialog(true)
  }

  // Ouvrir le dialogue de changement de rôle
  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setShowRoleDialog(true)
  }

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  // Voir profil (redirection)
  const viewProfile = (user: User) => {
    router.push(`/admin/users/${user.id}`)
  }

  // Envoyer email (ouvrir mail client)
  const sendEmail = (user: User) => {
    window.location.href = `mailto:${user.email}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Stats Cards avec filtres */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${filterRole === null ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterRole(null)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${filterRole === "client" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterRole("client")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.clients}</p>
              <p className="text-sm text-muted-foreground">Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${filterRole === "conseiller" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterRole("conseiller")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.conseillers}</p>
              <p className="text-sm text-muted-foreground">Conseillers</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${filterRole === "gestionnaire" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterRole("gestionnaire")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.gestionnaires}</p>
              <p className="text-sm text-muted-foreground">Gestionnaires</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${filterRole === "admin" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setFilterRole("admin")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Administrateurs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} 
            {filterRole ? ` - Rôle: ${roleLabels[filterRole]?.label}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Points fidélité</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getDisplayName(user)}</p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{user.loyalty_points || 0}</span>
                      <span className="text-muted-foreground ml-1">pts</span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      ) : (
                        <Badge variant="destructive">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div suppressHydrationWarning>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewProfile(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir profil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendEmail(user)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Modifier rôle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.is_active ? (
                                <>❌ Désactiver</>
                              ) : (
                                <>✅ Activer</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Ajouter */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur sur la plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="utilisateur@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Nom"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                placeholder="+221 77 123 45 67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="conseiller">Conseiller</SelectItem>
                  <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddUser} disabled={isPending}>
              {isPending ? "Création..." : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Nom"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                placeholder="+221 77 123 45 67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEditUser} disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Changer rôle */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau rôle pour {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(roleLabels).map(([value, { label }]) => (
                <Button
                  key={value}
                  variant={selectedUser?.role === value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleRoleChange(value)}
                  disabled={isPending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.email}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              {isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}