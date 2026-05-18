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

  // Notifier le client
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "in_app",
    subject: "Demande de consultation reçue",
    content: `Votre demande de conseil pour "${eventType}" a bien été reçue. Un conseiller vous répondra sous 24h.`,
  })

  revalidatePath("/dashboard/consultations")
  redirect("/dashboard/consultations")
}

// Répondre à une consultation (conseiller/admin)
export async function respondToConsultation(
  consultationId: string,
  advisorResponse: string,
  newStatus: "in_progress" | "completed"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorisé" }

  const { error } = await supabase
    .from("consultations")
    .update({
      advisor_id: user.id,
      advisor_response: advisorResponse,
      status: newStatus,
      responded_at: new Date().toISOString(),
    })
    .eq("id", consultationId)

  if (error) return { error: "Impossible de mettre à jour" }

  // Notifier le client
  const { data: consultation } = await supabase
    .from("consultations")
    .select("client_id, event_type")
    .eq("id", consultationId)
    .single()

  if (consultation) {
    await supabase.from("notifications").insert({
      user_id: consultation.client_id,
      type: "in_app",
      subject: "Réponse de votre conseiller",
      content: `Votre conseiller a répondu à votre demande pour "${consultation.event_type}". Consultez votre espace personnel pour voir les recommandations.`,
    })
  }

  revalidatePath("/admin/consultations")
  revalidatePath("/dashboard/consultations")
  return { success: true }
}

// Assigner un conseiller
export async function assignAdvisor(consultationId: string, advisorId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("consultations")
    .update({ advisor_id: advisorId, status: "assigned" })
    .eq("id", consultationId)

  if (error) return { error: "Impossible d'assigner le conseiller" }

  revalidatePath("/admin/consultations")
  return { success: true }
}