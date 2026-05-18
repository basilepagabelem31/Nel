// Chemin : components/admin/promo-code-actions.tsx
"use client"

import { useTransition } from "react"
import { MoreHorizontal, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PromoCodeActionsProps {
  promoCode: {
    id: string
    code: string
    is_active: boolean
  }
}

export function PromoCodeActions({ promoCode }: PromoCodeActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleActive = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !promoCode.is_active })
        .eq("id", promoCode.id)

      if (error) {
        toast.error("Erreur lors de la modification")
        return
      }

      toast.success(promoCode.is_active ? "Code désactivé" : "Code activé")
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("id", promoCode.id)

      if (error) {
        toast.error("Impossible de supprimer ce code")
        return
      }

      toast.success("Code supprimé")
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggleActive}>
            {promoCode.is_active ? (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" />
                Désactiver
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" />
                Activer
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le code promo ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le code <strong>{promoCode.code}</strong> sera supprimé définitivement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}