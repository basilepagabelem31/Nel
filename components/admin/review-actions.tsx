// Chemin : components/admin/review-actions.tsx
"use client"

import { useTransition } from "react"
import { CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReviewActionsProps {
  review: {
    id: string
    status: string
  }
}

export function ReviewActions({ review }: ReviewActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const updateStatus = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", review.id)

      if (error) {
        toast.error("Erreur lors de la modération")
        return
      }

      toast.success(status === "approved" ? "Avis approuvé" : "Avis refusé")
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {review.status !== "approved" && (
          <DropdownMenuItem onClick={() => updateStatus("approved")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Approuver
          </DropdownMenuItem>
        )}
        {review.status !== "rejected" && (
          <DropdownMenuItem
            onClick={() => updateStatus("rejected")}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Refuser
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}