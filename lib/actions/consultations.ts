// Chemin : lib/actions/consultations.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createConsultation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const eventType = formData.get("event_type") as string
  const eventDate = formData.get("event_date") as string
  const budget = formData.get("budget") ? parseFloat(formData.get("budget") as string) : null
  const preferences = formData.get("preferences") as string
  const clientMessage = formData.get("client_message") as string

  if (!eventType) return { error: "Type d'événement requis" }

  const { error } = await supabase.from("consultations").insert({
    client_id: user.id,
    event_type: eventType,
    event_date: eventDate || null,
    budget,
    preferences,
    client_message: clientMessage,
    status: "pending",
  })

  if (error) return { error: "Impossible de créer la consultation" }

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "in_app",
    subject: "Demande de consultation reçue",
    content: `Votre demande de conseil pour "${eventType}" a bien été reçue. Un conseiller vous répondra sous 24h.`,
  })

  revalidatePath("/dashboard/consultations")
  redirect("/dashboard/consultations")
}

// ✅ Fonction pour répondre à une consultation (via formulaire)
export async function respondToConsultation(formData: FormData) {
  const consultationId = formData.get("consultation_id") as string
  const response = formData.get("response") as string
  const status = formData.get("status") as "in_progress" | "completed"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { error } = await supabase
    .from("consultations")
    .update({
      advisor_response: response,
      status: status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", consultationId)
    .eq("advisor_id", user.id)

  if (error) {
    console.error("Erreur:", error)
    redirect(`/conseiller/consultations/${consultationId}?error=${encodeURIComponent(error.message)}`)
  }

  // Récupérer le client pour la notification
  const { data: consultation } = await supabase
    .from("consultations")
    .select("client_id, event_type")
    .eq("id", consultationId)
    .single()

  if (consultation) {
    await supabase.from("notifications").insert({
      user_id: consultation.client_id,
      type: "in_app",
      subject: "Réponse à votre consultation",
      content: `Un conseiller a répondu à votre demande concernant "${consultation.event_type}". Connectez-vous pour voir les recommandations.`,
    })
  }

  revalidatePath(`/conseiller/consultations/${consultationId}`)
  revalidatePath("/conseiller/consultations")
  revalidatePath("/admin/consultations")
  
  redirect("/conseiller/consultations")
}

// ✅ Assigner un conseiller à une consultation (admin/gestionnaire)
export async function assignAdvisor(consultationId: string, advisorId: string) {
  const supabase = await createClient()

  // Vérifier que l'utilisateur est admin ou gestionnaire
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!["admin", "gestionnaire"].includes(profile?.role || "")) {
    return { error: "Permission refusée" }
  }

  // Vérifier que le conseiller existe
  const { data: advisor } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", advisorId)
    .eq("role", "conseiller")
    .single()

  if (!advisor) {
    return { error: "Conseiller non trouvé" }
  }

  // Assigner le conseiller et changer le statut
  const { error } = await supabase
    .from("consultations")
    .update({ 
      advisor_id: advisorId, 
      status: "assigned",
      responded_at: new Date().toISOString()
    })
    .eq("id", consultationId)

  if (error) return { error: "Impossible d'assigner le conseiller" }

  // Notifier le conseiller
  const { data: consultation } = await supabase
    .from("consultations")
    .select("client_id, event_type")
    .eq("id", consultationId)
    .single()

  if (consultation) {
    await supabase.from("notifications").insert({
      user_id: advisorId,
      type: "in_app",
      subject: "Nouvelle consultation assignée",
      content: `Une nouvelle consultation "${consultation.event_type}" vous a été assignée.`,
    })
  }

  revalidatePath("/admin/consultations")
  revalidatePath("/conseiller/consultations")
  return { success: true }
}

// ✅ Mettre à jour le statut d'une consultation (admin/gestionnaire)
export async function updateConsultationStatus(
  consultationId: string, 
  newStatus: "assigned" | "in_progress" | "completed" | "cancelled"
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!["admin", "gestionnaire"].includes(profile?.role || "")) {
    return { error: "Permission refusée" }
  }

  const { error } = await supabase
    .from("consultations")
    .update({ status: newStatus })
    .eq("id", consultationId)

  if (error) return { error: "Impossible de mettre à jour" }

  revalidatePath("/admin/consultations")
  return { success: true }
}

// ✅ Récupérer toutes les consultations avec les infos client et conseiller
export async function getAllConsultations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consultations")
    .select(`
      *,
      client:profiles!consultations_client_id_fkey (id, first_name, last_name, email, phone),
      advisor:profiles!consultations_advisor_id_fkey (id, first_name, last_name, email)
    `)
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}

// ✅ Récupérer les consultations d'un conseiller spécifique
export async function getAdvisorConsultations(advisorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consultations")
    .select(`
      *,
      client:profiles!consultations_client_id_fkey (id, first_name, last_name, email, phone)
    `)
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}