// Chemin : app/api/conseiller/respond/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const consultationId = formData.get("consultation_id") as string
  const response = formData.get("response") as string
  const status = formData.get("status") as "in_progress" | "completed"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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
      subject: "Réponse à votre consultation",
      content: `Un conseiller a répondu à votre demande concernant "${consultation.event_type}".`,
    })
  }

  return NextResponse.json({ success: true })
}