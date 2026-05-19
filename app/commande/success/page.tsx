// app/commande/success/page.tsx
import { Suspense } from "react"
import SuccessContent from "./success-content"

export const metadata = {
  title: "Commande confirmée",
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  )
}