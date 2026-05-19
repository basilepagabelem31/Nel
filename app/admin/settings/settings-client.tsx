// Chemin : app/admin/settings/settings-client.tsx
"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { updateSettings } from "@/lib/actions/settings"

interface SettingsClientProps {
  initialSettings: Record<string, string>
  children: React.ReactNode
}

export function SettingsClient({ initialSettings, children }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Paramètres enregistrés avec succès")
        // 🔥 Forcer un hard refresh pour recharger toutes les données
        window.location.href = "/admin/settings"
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {children}
      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" className="gap-2 shadow-lg" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Enregistrement..." : "Enregistrer toutes les modifications"}
        </Button>
      </div>
    </form>
  )
}