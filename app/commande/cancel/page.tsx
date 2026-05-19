// app/commande/cancel/page.tsx
'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Paiement annulé</h1>
        <p className="text-gray-600 mb-8">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>
        <div className="space-x-4">
          <Link
            href="/panier"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Retour au panier
          </Link>
          <Link
            href="/catalogue"
            className="inline-block border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}