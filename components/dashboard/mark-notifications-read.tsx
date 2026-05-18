// Chemin : components/dashboard/mark-notifications-read.tsx
"use client"

import { useTransition } from "react"
import { CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface MarkNotificationsReadProps {
  userId: string
}

export function MarkNotificationsRead({ userId }: MarkNotificationsReadProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const markAllRead = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        toast.error("Erreur lors de la mise à jour")
        return
      }

      toast.success("Toutes les notifications marquées comme lues")
      router.refresh()
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={markAllRead}
      disabled={isPending}
    >
      <CheckCheck className="h-4 w-4" />
      {isPending ? "..." : "Tout marquer comme lu"}
    </Button>
  )
}