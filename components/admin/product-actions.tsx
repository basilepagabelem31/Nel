// Chemin : components/admin/product-actions.tsx
"use client"

import Link from "next/link"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface ProductActionsProps {
  productId: string
  slug: string
  onDelete?: (id: string) => void
}

export function ProductActions({ productId, slug, onDelete }: ProductActionsProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      onDelete?.(productId)
    }
  }

  return (
    <div suppressHydrationWarning>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/produit/${slug}`} className="flex items-center gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              Voir
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${productId}/edit`} className="flex items-center gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              Modifier
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}