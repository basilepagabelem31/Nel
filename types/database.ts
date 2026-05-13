// Database types for Nella@House Consulting

export type UserRole = "client" | "conseiller" | "gestionnaire" | "admin"

export type OrderStatus = 
  | "en_attente" 
  | "confirmee" 
  | "en_preparation" 
  | "expediee" 
  | "livree" 
  | "annulee"

export type PaymentStatus = 
  | "en_attente" 
  | "paye" 
  | "echoue" 
  | "rembourse"

export type PaymentMethod = "carte" | "paypal" | "mobile_money"

export type ConsultationStatus = 
  | "en_attente" 
  | "confirmee" 
  | "terminee" 
  | "annulee"

export type ConsultationType = "virtuelle" | "en_personne"

export type AddressType = "livraison" | "facturation"

export type PromotionType = "pourcentage" | "montant_fixe" | "livraison_gratuite"

export interface Profile {
  id: string
  email: string
  nom: string | null
  prenom: string | null
  telephone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  nom_fr: string
  nom_en: string
  description_fr: string | null
  description_en: string | null
  image_url: string | null
  parent_id: string | null
  slug: string
  ordre: number
  est_actif: boolean
  created_at: string
}

export interface Artisan {
  id: string
  nom: string
  bio_fr: string | null
  bio_en: string | null
  photo_url: string | null
  pays: string
  specialite: string | null
  est_actif: boolean
  created_at: string
}

export interface Product {
  id: string
  nom_fr: string
  nom_en: string
  description_fr: string | null
  description_en: string | null
  prix: number
  prix_promo: number | null
  categorie_id: string | null
  stock: number
  images: string[]
  tailles: string[]
  couleurs: string[]
  materiaux: string | null
  origine_pays: string | null
  artisan_id: string | null
  est_actif: boolean
  est_vedette: boolean
  slug: string
  created_at: string
  updated_at: string
  // Joined relations
  categorie?: Category
  artisan?: Artisan
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  panier_id: string
  produit_id: string
  quantite: number
  taille: string | null
  couleur: string | null
  prix_unitaire: number
  // Joined relations
  produit?: Product
}

export interface Address {
  id: string
  user_id: string
  nom: string
  prenom: string
  telephone: string | null
  ligne1: string
  ligne2: string | null
  ville: string
  code_postal: string | null
  pays: string
  est_defaut: boolean
  type: AddressType
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  numero_commande: string
  statut: OrderStatus
  sous_total: number
  frais_livraison: number
  remise: number
  total: number
  adresse_livraison: Record<string, unknown>
  mode_paiement: PaymentMethod | null
  paiement_statut: PaymentStatus
  stripe_session_id: string | null
  paypal_order_id: string | null
  promotion_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined relations
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  commande_id: string
  produit_id: string
  quantite: number
  taille: string | null
  couleur: string | null
  prix_unitaire: number
  // Joined relations
  produit?: Product
}

export interface Review {
  id: string
  user_id: string
  produit_id: string
  note: number
  commentaire: string | null
  est_approuve: boolean
  created_at: string
  // Joined relations
  profile?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  produit_id: string
  created_at: string
  // Joined relations
  produit?: Product
}

export interface StyleConsultation {
  id: string
  client_id: string
  conseiller_id: string | null
  date_rdv: string | null
  statut: ConsultationStatus
  type: ConsultationType
  notes_client: string | null
  notes_conseiller: string | null
  recommendations: string | null
  created_at: string
  updated_at: string
  // Joined relations
  client?: Profile
  conseiller?: Profile
}

export interface Message {
  id: string
  expediteur_id: string
  destinataire_id: string
  consultation_id: string | null
  contenu: string
  lu: boolean
  created_at: string
  // Joined relations
  expediteur?: Profile
  destinataire?: Profile
}

export interface Promotion {
  id: string
  code: string
  type: PromotionType
  valeur: number
  date_debut: string
  date_fin: string
  usage_max: number | null
  usage_actuel: number
  est_actif: boolean
  created_at: string
}

export interface ShippingZone {
  id: string
  pays: string
  ville: string | null
  frais: number
  delai_jours: number
  est_actif: boolean
  created_at: string
}

export interface SiteSetting {
  id: string
  cle: string
  valeur: string
  type: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  titre: string
  contenu: string
  type: string
  lu: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// Utility types for forms and API
export type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at" | "categorie" | "artisan">
export type CategoryFormData = Omit<Category, "id" | "created_at">
export type ArtisanFormData = Omit<Artisan, "id" | "created_at">
export type AddressFormData = Omit<Address, "id" | "user_id" | "created_at">
export type PromotionFormData = Omit<Promotion, "id" | "usage_actuel" | "created_at">

// Cart with items
export interface CartWithItems extends Cart {
  items: (CartItem & { produit: Product })[]
}

// Order with details
export interface OrderWithDetails extends Order {
  items: (OrderItem & { produit: Product })[]
  profile: Profile
}
