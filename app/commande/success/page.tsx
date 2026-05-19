// app/commande/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId && orderId) {
      // Optionnel: vérifier le statut du paiement
      setLoading(false)
    }
  }, [sessionId, orderId])

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Confirmation de votre paiement...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Paiement confirmé ! 🎉</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre commande. Vous allez recevoir un email de confirmation dans quelques instants.
        </p>
        <div className="space-x-4">
          <Link
            href="/dashboard/orders"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Voir mes commandes
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