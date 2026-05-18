// Chemin : components/consultation/consultation-form.tsx
"use client"

import { useState, useTransition } from "react"
import { Calendar, Target, MessageSquare, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createConsultation } from "@/lib/actions/consultations"

interface ConsultationFormProps {
  userId: string
  userName: string
}

const EVENT_TYPES = [
  "Mariage",
  "Anniversaire",
  "Soirée de gala",
  "Concert / Festival",
  "Cérémonie traditionnelle",
  "Baptême / Baby shower",
  "Sortie professionnelle",
  "Photoshoot",
  "Voyage / Vacances",
  "Autre",
]

export function ConsultationForm({ userId, userName }: ConsultationFormProps) {
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    event_type: "",
    event_date: "",
    budget: "",
    preferences: "",
    client_message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.event_type) {
      toast.error("Veuillez sélectionner un type d'événement")
      return
    }

    startTransition(async () => {
      const fd = new FormData()
      fd.append("event_type", form.event_type)
      fd.append("event_date", form.event_date)
      fd.append("budget", form.budget)
      fd.append("preferences", form.preferences)
      fd.append("client_message", form.client_message)

      const result = await createConsultation(fd)

      if (result?.error) {
        toast.error(result.error)
      }
      // On success, createConsultation redirects to /dashboard/consultations
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Greeting */}
      {userName && (
        <p className="text-sm text-muted-foreground">
          Bonjour <span className="font-medium text-foreground">{userName}</span> 👋 — décrivez votre besoin ci-dessous.
        </p>
      )}

      {/* Event details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Votre événement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type d'événement <span className="text-destructive">*</span></Label>
            <Select value={form.event_type} onValueChange={(v) => setForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type d'occasion" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date de l'événement</Label>
              <Input
                type="date"
                value={form.event_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Budget indicatif (EUR)</Label>
              <Input
                type="number"
                min="0"
                step="10"
                placeholder="Ex: 200"
                value={form.budget}
                onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Vos préférences stylistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Décrivez vos préférences : couleurs favorites, style (traditionnel, moderne, mixte), morphologie particulière, pièces que vous aimez ou n'aimez pas..."
            value={form.preferences}
            onChange={(e) => setForm(f => ({ ...f, preferences: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Message à votre conseiller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Toute information complémentaire qui pourrait aider votre conseiller à vous faire la meilleure recommandation..."
            value={form.client_message}
            onChange={(e) => setForm(f => ({ ...f, client_message: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Info banner */}
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm">
        <p className="font-medium mb-1">✨ Comment ça marche ?</p>
        <ul className="text-muted-foreground space-y-1">
          <li>1. Vous soumettez votre demande</li>
          <li>2. Un conseiller Nella@House l'examine et vous propose des articles</li>
          <li>3. Vous recevez une réponse personnalisée sous 24h</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isPending || !form.event_type}
      >
        <Send className="h-4 w-4" />
        {isPending ? "Envoi en cours..." : "Envoyer ma demande de conseil"}
      </Button>
    </form>
  )
}