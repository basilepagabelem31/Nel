// Chemin : components/conseiller/consultation-response-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

interface ConsultationResponseFormProps {
  consultationId: string
}

export function ConsultationResponseForm({ consultationId }: ConsultationResponseFormProps) {
  const router = useRouter()
  const [response, setResponse] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (status: "in_progress" | "completed") => {
    if (!response.trim()) {
      toast.error("Veuillez écrire une réponse")
      return
    }

    setIsPending(true)

    const formData = new FormData()
    formData.append("consultation_id", consultationId)
    formData.append("response", response)
    formData.append("status", status)

    try {
      const res = await fetch("/api/conseiller/respond", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success(status === "completed" ? "Réponse envoyée" : "Réponse sauvegardée")
      router.refresh()
      router.push("/conseiller/consultations")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répondre au client</CardTitle>
        <CardDescription>
          Proposez des conseils personnalisés et recommandez des produits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Votre réponse</Label>
          <Textarea
            placeholder="Bonjour, suite à votre demande, je vous recommande..."
            rows={6}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit("in_progress")}
            disabled={isPending}
          >
            {isPending ? "Envoi..." : "Sauvegarder (en cours)"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit("completed")}
            disabled={isPending}
          >
            {isPending ? "Envoi..." : "Envoyer et marquer comme terminée"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}