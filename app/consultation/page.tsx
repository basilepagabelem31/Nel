// Chemin : app/consultation/page.tsx

import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import { ConsultationForm } from "@/components/consultation/consultation-form"

export const metadata = {
  title: "Demande de conseil vestimentaire",
  description: "Obtenez les conseils personnalisés de nos experts en style africain pour votre prochain événement.",
}

export default async function ConsultationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/consultation")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="bg-gradient-to-r from-secondary via-background to-accent/20 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mon Conseiller</h1>
            <p className="text-muted-foreground max-w-xl">
              Nos experts en style africain vous accompagnent pour chaque événement. 
              Remplissez ce formulaire et recevez des recommandations personnalisées sous 24h.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <ConsultationForm
              userId={user.id}
              userName={profile ? `${profile.first_name} ${profile.last_name}` : ""}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}